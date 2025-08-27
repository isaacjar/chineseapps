let LANG = 'en';
let DICT = {};
const FALLBACK = {
  ui: {
    settings: "Settings",
    start: "Start",
    backMenu: "Back to menu",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    lives: "Lives",
    score: "Score",
    streak: "Streak",
    time: "Time",
    next: "Next",
    yourAnswer: "Your answer",
    correct: "Correct!",
    wrong: "Try again",
    outOfTime: "Time's up!",
  },
  menu: {
    title: "HanShu 🌿🏯 — Chinese Numbers",
    subtitle: "Playful practice with characters, digits and pinyin",
    recognition: "🔢 Visual recognition",
    reverse: "✍️ Reverse writing",
    pinyinChars: "✍️ Choose correct pinyin (characters)",
    pinyinDigits: "✍️ Choose correct pinyin (digits)",
    memory: "🧠 Memory",
    settings: "⚙️ Settings",
  },
  settings: {
    title: "⚙️ Settings",
    language: "Language 🌎",
    pinyin: "Show pinyin hints 🐼",
    range: "Number range 🏔️",
    qcount: "Questions per game 🏅",
    qtime: "Time per question ⏱️",
    fails: "Allowed mistakes ❤️",
    ranges: {
      r1_10: "1–10",
      r11_99: "11–99",
      r100_999: "100–999",
      r1000p: "1000+"
    }
  },
  games: {
    recognitionPrompt: "What number is this? 🌸",
    reversePrompt: "Choose the correct characters 🏯",
    pinyinCharsPrompt: "Choose the correct pinyin 🎋",
    pinyinDigitsPrompt: "Choose the correct pinyin 🎋",
    memoryShow: "Memorize the sequence 🍃",
    memoryRecall: "Type the sequence (commas or spaces) 🧠",
    finalScore: "Final score",
    playAgain: "Play again"
  }
};

export async function initI18n() {
  try{
    const resp = await fetch('./assets/lang/lang.json');
    const data = await resp.json();
    DICT = data;
    const saved = localStorage.getItem('lang') || 'en';
    LANG = saved in DICT ? saved : 'en';
  }catch(e){
    console.warn('i18n fallback active', e);
    DICT = { en: FALLBACK, es: FALLBACK, fr: FALLBACK, pt: FALLBACK, de: FALLBACK, ur: FALLBACK };
    LANG = 'en';
  }
}

export function t(path){
  const parts = path.split('.');
  let obj = DICT[LANG] || FALLBACK;
  for(const p of parts){
    if(obj && p in obj) obj = obj[p]; else return path;
  }
  return obj;
}

export function currentLangCode(){ return LANG; }

export async function setLanguage(code){
  if(!(code in DICT)) return;
  LANG = code;
  localStorage.setItem('lang', code);
  // Broadcast
  window.dispatchEvent(new CustomEvent('lang-changed', { detail: { code }}));
}
