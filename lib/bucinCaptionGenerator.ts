import type { TierInfo } from "./scoring";
import type { CaptionStyle } from "./captionGenerator";

const HASHTAGS_BY_TIER: Record<number, string[]> = {
  1: ["#HatiEs", "#AntiBucin", "#SeberapaBucin", "#KuisBucin"],
  2: ["#NormalAja", "#SayangSewajarnya", "#SeberapaBucin", "#KuisBucin"],
  3: ["#BucinPemula", "#AwalKebucinan", "#SeberapaBucin", "#KuisBucin"],
  4: ["#BucinAkut", "#DuniaMilikBerdua", "#SeberapaBucin", "#KuisBucin"],
  5: ["#BudakCintaSejati", "#BucinLevelDewa", "#SeberapaBucin", "#KuisBucin", "#TakBisaHidupTanpamu"],
};

const BUCIN_CAPTIONS: Record<CaptionStyle, Record<number, string[]>> = {
  roast: {
    1: [
      "Hati es banget nih? Atau emang belum laku aja? 😂",
      "Kamu gak bucin, tapi yakin bahagia sendirian? 💀",
    ],
    2: [
      "Sayang sewajarnya? Hati-hati ntar keduluan ditikung orang 😏",
      "Masih normal katanya, padahal aslinya malu-malu mau 🫡",
    ],
    3: [
      "Cieee mulai overthinking tiap dia balas lama. Selamat datang di dunia bucin 🤦",
      "Mulai sering ngalah ya? Gak apa-apa, namanya juga bucin pemula 👏",
    ],
    4: [
      "Dunia milik berdua, yang lain ngontrak. Udah bayar kosan belum? 😂",
      "Awas jangan terlalu bucin, ntar ditinggalin nangisnya lama 💀",
    ],
    5: [
      "Selamat! Kamu sudah mendedikasikan seluruh hidupmu untuknya. Jangan lupa napas ya 👑",
      "Budak cinta sejati. Harga dirimu di mana kawan? 😂",
    ],
  },
  praise: {
    1: [
      "Keren! Kamu punya prinsip dan gak gampang baper. Pertahankan! ✨",
      "Logika jalan terus. Kamu tahu apa yang kamu mau. Salut! 🌱",
    ],
    2: [
      "Keseimbangan yang luar biasa! Kamu peduli tapi tetap punya batasan sehat. 🌸",
      "Sayang sewajarnya adalah kunci hubungan jangka panjang yang sehat! 🎯",
    ],
    3: [
      "Cinta itu indah, dan kamu mulai merasakannya dengan tulus! ⚔️",
      "Pengorbanan kecilmu sangat berarti buat dia. Keep it up! 🎨",
    ],
    4: [
      "Dedikasimu untuk pasangan sangat luar biasa! Dia pasti bahagia punya kamu! 🏆",
      "Cintamu tulus dan kamu gak ragu buat menunjukkannya! 🌟",
    ],
    5: [
      "Wow! Totalitas tanpa batas! Cintamu benar-benar murni dan tanpa syarat! 👑",
      "Bucin sejati! Kesetiaan dan pengorbananmu patut diacungi jempol! 🙇",
    ],
  },
  dramatis: {
    1: [
      "Di balik dinginnya sikapmu, mungkinkah ada hati yang menunggu dihangatkan? 🌙",
      "Tembok pertahananmu begitu tinggi, siapa yang kelak mampu meruntuhkannya? ⏳",
    ],
    2: [
      "Dua sisi saling tarik menarik. Cinta dan logika menari dalam harmoni yang sunyi... ⚔️",
      "Kamu melangkah perlahan, memastikan hatimu tak terlalu dalam terjatuh... 🌊",
    ],
    3: [
      "Dan perlahan, pertahananmu mulai runtuh. Senyumnya kini menjadi alasanmu bahagia... 🌸",
      "Sebuah benih cinta telah tertanam dalam, akarnya perlahan mengikat hatimu... ✨",
    ],
    4: [
      "Dunia perlahan memudar, menyisakan hanya kamu dan dia dalam kanvas keabadian... 🏆",
      "Kau serahkan segalanya, membiarkan dirimu tenggelam dalam lautan asmara... 💫",
    ],
    5: [
      "Tak ada lagi 'aku', yang ada hanyalah 'kita'. Kau persembahkan seluruh jiwamu... 👑",
      "Di altar cinta, kau relakan dirimu menjadi hamba yang setia untuk selamanya... 🌟",
    ],
  },
  meme: {
    1: [
      "Me: Aku anti bucin!\nAlso me: *Liat orang pacaran*\n'Kapan giliran gue?' 😭",
      "POV: Kamu lebih milih uang daripada cinta. Valid. 💀",
    ],
    2: [
      "Orang: Lo bucin ya?\nMe: Enggak, sayang sewajarnya aja.\nAlso me: *Stalking dari jam 1 pagi* 😤",
      "Tier 2 is just Tier 5 in denial. We all know the truth 🌸",
    ],
    3: [
      "Me: Gak mau chat duluan gengsi.\n*5 menit kemudian*\nMe: 'Lagi apa?' 😭",
      "POV: Kamu bilang gak cemburu, tapi story dia di-reply orang langsung overthinking 💀",
    ],
    4: [
      "Temen: Ayo nongkrong!\nMe: Gak bisa, mau nemenin ayang.\nTemen: 🤡",
      "POV: Password HP, PIN ATM, semua isinya tanggal lahir dia 🏛️",
    ],
    5: [
      "Bucin Sejati: *Napas aja buat ayang* 👑",
      "POV: Kamu ditanyain hobi, jawabnya 'Ngebahagiain dia' 💀",
    ],
  },
};

export function generateBucinCaption(tierInfo: TierInfo, style: CaptionStyle): string {
  const tierCaptions = BUCIN_CAPTIONS[style][tierInfo.tier];
  const randomCaption = tierCaptions[Math.floor(Math.random() * tierCaptions.length)];
  const hashtags = HASHTAGS_BY_TIER[tierInfo.tier].join(" ");
  return `${randomCaption}\n\n${hashtags}`;
}
