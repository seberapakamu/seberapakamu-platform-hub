"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { BucinNavbar, BucinFooter } from "@/components/bucin/BucinNav";
import { COUPLE_SYNC_QUESTIONS, CoupleQuestion } from "@/lib/couple-questions";

export default function CoupleSyncRoomPage() {
  const { code } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIndex = parseInt(searchParams.get("u") || "0");
  const userName = searchParams.get("name") || "Anomali";
  
  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<CoupleQuestion[]>([]);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [myAnswers, setMyAnswers] = useState<Record<number, string>>({});
  const [partnerAnswers, setPartnerAnswers] = useState<Record<number, string>>({});
  const [myFinished, setMyFinished] = useState(false);
  const [partnerFinished, setPartnerFinished] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createBrowserClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    if (!code || userIndex === 0) {
      router.push("/bucin/couple-sync");
      return;
    }

    const initRoom = async () => {
      // Fetch Questions & Room Data in parallel
      const [roomRes, questionsRes] = await Promise.all([
        supabase
          .from("couple_rooms")
          .select("*, couple_answers(*)")
          .eq("code", code)
          .single(),
        supabase
          .from("couple_questions")
          .select("*")
          .eq("aktif", true)
          .order("urutan", { ascending: true })
      ]);

      if (!mounted) return;

      if (roomRes.error || !roomRes.data) {
        setError("Room tidak ditemukan.");
        setLoading(false);
        return;
      }

      if (questionsRes.error || !questionsRes.data || questionsRes.data.length === 0) {
        setError("Gagal memuat soal kuis.");
        setLoading(false);
        return;
      }

      const roomData = roomRes.data;
      setRoom(roomData);
      setQuestions(questionsRes.data);
      
      // Load existing answers if any
      const myAns = roomData.couple_answers.find((a: any) => a.user_index === userIndex);
      const partnerAns = roomData.couple_answers.find((a: any) => a.user_index !== userIndex);
      
      if (myAns) {
        setMyAnswers(myAns.answers || {});
        setMyFinished(myAns.is_finished);
      }
      if (partnerAns) {
        setPartnerAnswers(partnerAns.answers || {});
        setPartnerFinished(partnerAns.is_finished);
      }

      setLoading(false);
      setupRealtime(roomData.id);
    };

    const setupRealtime = (roomId: string) => {
      // Clean up any existing channel with the same name first to be safe
      const channelName = `room:${roomId}`;
      const existingChannel = supabase.getChannels().find((c: any) => c.topic === `realtime:${channelName}`);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: userIndex.toString(),
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          if (!mounted) return;
          const state = channel.presenceState();
          const partnerIdx = userIndex === 1 ? "2" : "1";
          setPartnerOnline(!!state[partnerIdx]);
        })
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "couple_rooms",
          filter: `id=eq.${roomId}`,
        }, (payload: any) => {
          if (!mounted) return;
          setRoom(payload.new);
        })
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "couple_answers",
          filter: `room_id=eq.${roomId}`,
        }, (payload: any) => {
          if (!mounted) return;
          if (payload.new.user_index === userIndex) {
            setMyAnswers(payload.new.answers);
            setMyFinished(payload.new.is_finished);
          } else {
            setPartnerAnswers(payload.new.answers);
            setPartnerFinished(payload.new.is_finished);
          }
        })
        .on("broadcast", { event: "answer-update" }, (payload: any) => {
            if (!mounted) return;
            // Efficiency: update UI immediately before DB sync reflects
            if (payload.payload.userIndex !== userIndex) {
                setPartnerAnswers(payload.payload.answers);
                setPartnerFinished(payload.payload.isFinished);
            }
        })
        .subscribe(async (status: any) => {
          if (status === "SUBSCRIBED" && mounted) {
            await channel.track({
              userIndex,
              name: userName,
              onlineAt: new Date().toISOString(),
            });
          }
        });

      channelRef.current = channel;
    };

    initRoom();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [code, userIndex]);

  const handleAnswer = async (questionId: number, value: string) => {
    const newAnswers = { ...myAnswers, [questionId]: value };
    setMyAnswers(newAnswers);

    const isLast = currentQuestionIdx === questions.length - 1;
    
    // Broadcast update for immediate feedback (efficiency)
    channelRef.current?.send({
      type: "broadcast",
      event: "answer-update",
      payload: {
        userIndex,
        answers: newAnswers,
        isFinished: isLast && Object.keys(newAnswers).length === questions.length
      },
    });

    // Sync to DB
    await supabase.from("couple_answers").upsert({
      room_id: room.id,
      user_index: userIndex,
      answers: newAnswers,
      is_finished: false, // Will be set to true only when clicking "Next" on the last question
      updated_at: new Date().toISOString(),
    }, { onConflict: "room_id, user_index" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="animate-bounce text-4xl">💖</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center" style={{ backgroundColor: "var(--color-bg)" }}>
       <div>
         <h1 className="text-2xl font-bold mb-4 text-red-500">{error}</h1>
         <button onClick={() => router.push("/bucin/couple-sync")} className="px-6 py-3 bg-primary text-white rounded-xl">Kembali</button>
       </div>
    </div>
  );

  const isBothFinished = myFinished && partnerFinished;
  const currentQuestion = questions[currentQuestionIdx];

  // Calculate Match
  const calculateMatch = () => {
    let matches = 0;
    questions.forEach(q => {
      if (myAnswers[q.id] && partnerAnswers[q.id] && myAnswers[q.id] === partnerAnswers[q.id]) {
        matches++;
      }
    });
    return Math.round((matches / questions.length) * 100);
  };

  const matchPercent = isBothFinished ? calculateMatch() : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <BucinNavbar />

      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          {/* Header Status */}
          <div 
            className="rounded-2xl p-4 mb-6 flex justify-between items-center shadow-md"
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 text-xl">👤</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-50">Kamu</p>
                <p className="font-black text-sm" style={{ color: "var(--color-text-bold)" }}>{userName}</p>
              </div>
            </div>

            <div className="text-center">
               <div className="text-xs font-black px-3 py-1 rounded-full border border-pink-200 text-pink-500 bg-pink-50">
                  {code}
               </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-50">Pasangan</p>
                <p className="font-black text-sm" style={{ color: "var(--color-text-bold)" }}>
                    {userIndex === 1 ? room.user2_name || "Menunggu..." : room.user1_name}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${partnerOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            </div>
          </div>

          {!room.user2_name ? (
             <div className="text-center py-20 bg-white rounded-3xl shadow-xl p-8">
                <div className="text-6xl mb-6">🔗</div>
                <h2 className="text-2xl font-black mb-2">Bagikan Kode Room</h2>
                <p className="mb-8 text-gray-500">Minta pasanganmu masuk pakai kode ini ya!</p>
                <div className="text-4xl font-black tracking-[0.5em] p-6 bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl text-pink-600 mb-8 select-all">
                    {code}
                </div>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(code as string);
                        alert("Kode disalin!");
                    }}
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg"
                >
                    Salin Kode
                </button>
             </div>
          ) : isBothFinished ? (
            /* RESULT SCREEN */
            <div className="animate-in fade-in zoom-in duration-500">
               <div className="text-center bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="bg-pink-500 py-12 text-white">
                      <div className="text-7xl mb-4">✨</div>
                      <h2 className="text-3xl font-black">HASIL SYNC</h2>
                  </div>
                  <div className="p-8">
                      <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="96" cy="96" r="88" fill="transparent" stroke="var(--color-border)" strokeWidth="12" />
                              <circle cx="96" cy="96" r="88" fill="transparent" stroke="var(--color-primary)" strokeWidth="12" 
                                      strokeDasharray={552} strokeDashoffset={552 - (552 * matchPercent) / 100} strokeLinecap="round" />
                          </svg>
                          <div className="text-center">
                              <span className="text-5xl font-black block">{matchPercent}%</span>
                              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Synchronized</span>
                          </div>
                      </div>

                      <p className="text-xl font-bold mb-8" style={{ color: "var(--color-text-bold)" }}>
                          {matchPercent === 100 ? "KALIAN ADALAH JIWA YANG SATU! ❤️" : 
                           matchPercent > 70 ? "Kalian kompak banget! Mantap. 🔥" :
                           matchPercent > 40 ? "Beda-beda tipis, tapi tetap seru! 😊" :
                           "Banyak bedanya, tapi perbedaan itu indah kan? 😅"}
                      </p>

                      <div className="space-y-4 text-left">
                          <h3 className="font-black text-sm uppercase opacity-40 border-b pb-2">Rincian Jawaban</h3>
                          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {questions.map((q, idx) => {
                                  const same = myAnswers[q.id] === partnerAnswers[q.id];
                                  return (
                                      <div key={q.id} className={`p-3 rounded-xl mb-2 flex justify-between items-center ${same ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
                                          <div className="flex-1">
                                              <p className="text-xs font-bold opacity-60">Soal {idx + 1}</p>
                                              <p className="text-sm font-bold truncate max-w-[200px]">{q.teks}</p>
                                          </div>
                                          <div className="flex gap-2 items-center">
                                              <div className="text-[10px] text-center px-2 py-1 rounded bg-white border border-gray-200">
                                                  {myAnswers[q.id] === "A" ? "Opsi 1" : "Opsi 2"}
                                              </div>
                                              <span className="text-lg">{same ? "✅" : "❌"}</span>
                                              <div className="text-[10px] text-center px-2 py-1 rounded bg-white border border-gray-200">
                                                  {partnerAnswers[q.id] === "A" ? "Opsi 1" : "Opsi 2"}
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>

                      <button 
                        onClick={() => router.push("/bucin/couple-sync")}
                        className="mt-8 w-full py-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        Coba Lagi
                      </button>
                  </div>
               </div>
            </div>
          ) : (
            /* QUIZ SCREEN */
            <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px] flex flex-col">
                    <div className="h-2 w-full bg-gray-100">
                        <div 
                            className="h-full bg-pink-500 transition-all duration-500" 
                            style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                        />
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        {myAnswers[currentQuestion.id] && partnerAnswers[currentQuestion.id] ? (
                            /* FEEDBACK SECTION */
                            <div className="text-center animate-in zoom-in duration-300">
                                {myAnswers[currentQuestion.id] === partnerAnswers[currentQuestion.id] ? (
                                    <>
                                        <div className="text-8xl mb-6">💖</div>
                                        <h2 className="text-4xl font-black text-pink-500 mb-2">SAMA!</h2>
                                        <p className="text-gray-500 mb-8">Kalian beneran sefrekuensi nih! 😍</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-8xl mb-6">💔</div>
                                        <h2 className="text-4xl font-black text-gray-400 mb-2">BEDA</h2>
                                        <p className="text-gray-500 mb-8">Wah, ternyata seleranya beda ya... 😅</p>
                                    </>
                                )}
                                
                                <div className="flex justify-center gap-4 mb-8">
                                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] font-bold uppercase opacity-40">Kamu</p>
                                        <p className="font-bold">{currentQuestion.opsi.find(o => o.value === myAnswers[currentQuestion.id])?.label}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] font-bold uppercase opacity-40">Pasangan</p>
                                        <p className="font-bold">{currentQuestion.opsi.find(o => o.value === partnerAnswers[currentQuestion.id])?.label}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={async () => {
                                        if (currentQuestionIdx === questions.length - 1) {
                                            setMyFinished(true);
                                            // Update personal status
                                            await supabase.from("couple_answers").update({ is_finished: true }).eq("room_id", room.id).eq("user_index", userIndex);
                                            
                                            // Check if partner is also finished to mark room as finished
                                            if (partnerFinished) {
                                                await supabase.from("couple_rooms").update({ status: "finished" }).eq("id", room.id);
                                            }
                                        } else {
                                            setCurrentQuestionIdx(prev => prev + 1);
                                        }
                                    }}
                                    className="px-10 py-4 bg-pink-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-transform"
                                >
                                    {currentQuestionIdx === questions.length - 1 ? "Lihat Hasil Akhir ✨" : "Lanjut Soal Berikutnya ➡️"}
                                </button>
                            </div>
                        ) : myAnswers[currentQuestion.id] ? (
                            /* WAITING SECTION */
                            <div className="text-center py-12">
                                <div className="text-6xl mb-6 animate-bounce">⏳</div>
                                <h2 className="text-2xl font-black mb-2">Menunggu Pasangan...</h2>
                                <p className="text-gray-500">Kamu sudah jawab, sekarang giliran dia!</p>
                                <div className="mt-8 inline-block px-6 py-3 rounded-2xl bg-pink-50 text-pink-500 font-bold border border-pink-100">
                                    Pilihanmu: {currentQuestion.opsi.find(o => o.value === myAnswers[currentQuestion.id])?.label}
                                </div>
                            </div>
                        ) : (
                            /* QUESTION SECTION */
                            <div className="animate-in slide-in-from-right duration-300">
                                <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-black mb-4">
                                    SOAL {currentQuestionIdx + 1} DARI {questions.length}
                                </span>
                                <h2 className="text-2xl font-black mb-8 leading-tight" style={{ color: "var(--color-text-bold)" }}>
                                    {currentQuestion.teks}
                                </h2>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.opsi.map((opsi) => (
                                        <button
                                            key={opsi.value}
                                            onClick={() => handleAnswer(currentQuestion.id, opsi.value)}
                                            className="group relative p-6 rounded-2xl border-2 text-left font-bold transition-all hover:border-pink-500 hover:bg-pink-50 active:scale-[0.98]"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg">{opsi.label}</span>
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">💖</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Status Summary */}
                <div className="flex justify-center gap-4">
                    <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${myAnswers[currentQuestion.id] ? "bg-green-500" : "bg-gray-300"}`} />
                        Status Kamu
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${partnerAnswers[currentQuestion.id] ? "bg-green-500" : "bg-gray-300"}`} />
                        Status Pasangan
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      <BucinFooter />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #db2777;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
