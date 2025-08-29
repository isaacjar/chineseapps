// i18n.js
const LANG_KEY = "hanshu-lang";
let currentLang = "en";
let translations = {};

// fallback mínimo garantizado (en inglés)
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
    outOfTime: "⏰ Out of time!",
    gameOver: "Game Over",
    finalScore: "Final Score",
    correctAnswers: "Correct Answers",
    restart: "Restart"
  },
  menu: {
    title: "Main Menu",
    subtitle: "Choose your game mode",
    recognition: "🔢 Visual recognition",
    reverse: "✍️ Reverse writing",
    pinyinChars: "✍️ Pinyin from characters",
    pinyinDigits: "✍️ Pinyin from digits",
    memory: "🧠 Memory",
    settings: "⚙️ Settings",
    start: "Start",
    exit: "Exit"
  },
  settings: {
    title: "Settings",
    language: "Language",
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

// ---------------- API ----------------

export async function setLanguage(lang) {
  currentLang = lang || "en";
  localStorage.setItem(LANG_KEY, currentLang);

  try {
    const res = await fetch("assets/lang/lang.json");
    const data = await res.json();
    translations = data[currentLang] || {};
  } catch (e) {
    console.error("i18n load error:", e);
    translations = {};
  }
}

export function getLanguage() {
  return currentLang;
}

/**
 * Traduce clave en notación tipo 'ui.score' o 'menu.title'
 */
export function t(key) {
  const parts = key.split(".");
  let obj = translations;
  let fallback = FALLBACK;

  for (const p of parts) {
    obj = obj?.[p];
    fallback = fallback?.[p];
  }
  return obj ?? fallback ?? key;
}

// ---------------- INIT ----------------

const saved = localStorage.getItem(LANG_KEY);
if (saved) {
  currentLang = saved;
}
