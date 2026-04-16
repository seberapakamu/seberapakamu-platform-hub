import type { TierInfo } from "./scoring";

export type CaptionStyle = "roast" | "praise" | "dramatis" | "meme";

const HASHTAGS_BY_TIER: Record<number, string[]> = {
  1: ["#CasualViewer", "#WibuPemula", "#SeberapaWibu", "#WibuQuiz"],
  2: ["#AnimeEnjoyer", "#WibuMuda", "#SeberapaWibu", "#WibuQuiz", "#AnimeLovers"],
  3: ["#WibuTerlatih", "#WibuGarisLurus", "#SeberapaWibu", "#WibuQuiz", "#OtakuIndonesia"],
  4: ["#WibuVeteran", "#EnsiklopediaAnime", "#SeberapaWibu", "#WibuQuiz", "#OtakuSejati"],
  5: ["#SepuhWibu", "#WibuLegend", "#SeberapaWibu", "#WibuQuiz", "#OtakuMaster", "#WibuPanutanBangsa"],
};

const CAPTIONS: Record<CaptionStyle, Record<number, string[]>> = {
  roast: {
    1: [
      "Baru nonton Naruto sekali terus ngaku wibu? Malu dong sama diri sendiri 😂",
      "Score segini mah masih bisa diselamatkan. Cepet tobat sebelum terlambat 🙏",
      "Wibu? Kamu bahkan belum hafal nama karakter utama satu anime pun 💀",
    ],
    2: [
      "Udah nonton banyak anime tapi masih pura-pura normal? Siapa yang kamu tipu? 😏",
      "Tier 2 nih, artinya kamu setengah wibu setengah malu-maluin 😂",
      "Masih bisa hidup normal katanya. Tunggu aja sampai ketemu anime yang tepat 🫡",
    ],
    3: [
      "Kosakata Jepang udah bocor ke chat sehari-hari ya? Sugoi sekali 🤦",
      "Wibu Terlatih — artinya udah gak bisa balik ke kehidupan normal. Selamat! 🎉",
      "Koleksi figurin mulai numpuk tapi dompet makin tipis. Prioritas yang bagus 👏",
    ],
    4: [
      "Ensiklopedia anime berjalan? Lebih tepatnya ensiklopedia pengangguran 😂",
      "Orang datang minta rekomendasi anime ke kamu? Kasihan mereka 💀",
      "Kamarmu museum? Maksudnya gudang barang gak berguna? 🏛️",
    ],
    5: [
      "Selamat, kamu telah berhasil menghancurkan masa depanmu dengan sempurna 👑",
      "Anime adalah napas katanya. Coba napas beneran dulu, bro 😂",
      "Level tertinggi wibu — artinya level terendah produktivitas. Achievement unlocked! 🏆",
    ],
  },
  praise: {
    1: [
      "Kamu masih pure dan belum terkontaminasi dunia per-wibu-an. Pertahankan! ✨",
      "Jiwa yang bersih, hati yang tenang. Kamu belum terjerumus. Salut! 🌱",
      "Casual viewer yang bijak! Nonton anime tapi tetap waras. Respect! 👏",
    ],
    2: [
      "Kamu berhasil menikmati anime tanpa kehilangan jati diri. Luar biasa! 🌸",
      "Balance antara dunia nyata dan anime? Kamu masternya! 🎯",
      "Anime enjoyer sejati — menikmati tanpa berlebihan. Kamu contoh yang baik! ✨",
    ],
    3: [
      "Wibu Terlatih dengan dedikasi tinggi! Perjalananmu menuju sepuh sudah dimulai! ⚔️",
      "Kamu sudah menemukan passion sejatimu. Anime adalah seni, dan kamu menghargainya! 🎨",
      "Koleksi dan pengetahuan anime yang impressive! Kamu benar-benar mencintai budaya ini! 💪",
    ],
    4: [
      "Wibu Veteran yang dihormati! Pengetahuanmu adalah harta yang tak ternilai! 🏆",
      "Kamu adalah pilar komunitas anime Indonesia! Terus sebarkan kebaikan wibu! 🌟",
      "Dedikasi dan passion yang luar biasa! Kamu inspirasi bagi wibu-wibu muda! 👑",
    ],
    5: [
      "Sepuh Wibu sejati! Kamu telah mencapai pencerahan tertinggi dalam dunia anime! 👑",
      "Legenda hidup! Pengetahuan dan dedikasimu tak tertandingi! Kami hormat! 🙇",
      "Kamu bukan sekadar wibu — kamu adalah warisan budaya anime Indonesia! 🌸",
    ],
  },
  dramatis: {
    1: [
      "Di persimpangan jalan, jiwa yang belum tersentuh anime berdiri sendirian... Sampai kapan? 🌙",
      "Satu benih telah ditanam. Satu hari nanti, pohon wibu akan tumbuh menjulang tinggi... ⏳",
      "Perjalanan seribu anime dimulai dari satu episode pertama. Kamu baru di awal... 🌅",
    ],
    2: [
      "Dua dunia bertarung dalam dirimu — dunia nyata dan dunia anime. Siapa yang akan menang? ⚔️",
      "Kamu berdiri di tepi jurang kewibuan. Satu langkah lagi, dan tidak ada jalan kembali... 🌊",
      "Mereka bilang kamu masih normal. Tapi di dalam hatimu, opening anime terus berputar... 🎵",
    ],
    3: [
      "Rubicon telah diseberangi. Tidak ada jalan pulang ke kehidupan sebelum anime... 🌸",
      "Seperti protagonis yang menemukan kekuatan tersembunyinya, kamu telah awakening! ✨",
      "Dunia nyata terasa pucat dibanding dunia anime yang kamu cintai. Ini baru permulaan... 🌙",
    ],
    4: [
      "Bertahun-tahun berjuang, ribuan episode ditonton, dan kini kamu berdiri sebagai veteran... 🏆",
      "Mereka yang datang meminta rekomendasimu tidak tahu betapa dalam pengorbananmu... 💫",
      "Kamarmu adalah saksi bisu perjalanan panjangmu menuju puncak kewibuan... 🏛️",
    ],
    5: [
      "Di puncak gunung kewibuan, angin bertiup kencang. Kamu telah sampai di tujuan akhir... 👑",
      "Legenda tidak dilahirkan — mereka ditempa oleh ribuan jam anime dan air mata fandom... 🌟",
      "Ketika semua orang tidur, kamu masih terjaga, menonton episode terakhir dari saga epik hidupmu... 🌙",
    ],
  },
  meme: {
    1: [
      "Me: Aku bukan wibu\nAlso me: *nonton anime sekali-sekali*\nScore: 😂",
      "POV: Kamu pikir nonton Naruto itu bukan wibu. Skill issue. 💀",
      "Tier 1 gang rise up! We still have a chance to be normal! (we don't) 🌱",
    ],
    2: [
      "Anime enjoyer: *exists*\nSociety: So you're a wibu?\nMe: I'm not like other wibus 😤",
      "POV: Masih bisa bilang 'aku bukan wibu' sambil nonton 3 anime sekaligus 💀",
      "Tier 2 is just Tier 5 in denial. We all know where this is going 🌸",
    ],
    3: [
      "Me: *accidentally says 'sugoi' in real life*\nEveryone: 👀\nMe: I can explain— 😭",
      "POV: Koleksi figurin 'cuma sedikit' tapi udah butuh rak baru 💀",
      "Wibu Terlatih = Wibu yang udah gak bisa disembuhkan tapi masih pura-pura bisa ⚔️",
    ],
    4: [
      "Friend: Rekomendasiin anime dong\nMe: *opens 47-page spreadsheet* 📊",
      "POV: Kamarmu lebih mirip toko anime daripada kamar tidur 🏛️",
      "Wibu Veteran: 'Aku masih bisa berhenti kapan saja'\nAlso them: *preorder season 12* 🏆",
    ],
    5: [
      "Sepuh Wibu: *breathes in Japanese* 👑",
      "POV: Kamu hafal semua opening anime tapi lupa ulang tahun sendiri 💀",
      "Final boss of wibus has entered the chat. Everyone else: 😱 👑",
    ],
  },
};

export function generateCaption(tierInfo: TierInfo, style: CaptionStyle): string {
  const tierCaptions = CAPTIONS[style][tierInfo.tier];
  const randomCaption = tierCaptions[Math.floor(Math.random() * tierCaptions.length)];
  const hashtags = HASHTAGS_BY_TIER[tierInfo.tier].join(" ");
  return `${randomCaption}\n\n${hashtags}`;
}

export function getRandomStyle(): CaptionStyle {
  const styles: CaptionStyle[] = ["roast", "praise", "dramatis", "meme"];
  return styles[Math.floor(Math.random() * styles.length)];
}
