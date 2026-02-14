// =====================
// STATE
// =====================
let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = 2;
let selectedVocab = null;
let usedWords = new Set();

// =====================
// GAME TYPES
// =====================
const GAME_TYPES = {
  meaning: { question: "hanzi", options: "meaning" },
  word:    { question: "meaning", options: "hanzi" },
  pinyin:  { question: "hanzi", options: "pinyin" }
};

// =====================
// GAMES (ANTES game1,2,3)
// =====================
const GAMES = {
  1: { mode: "hanzi-to-pinyin" },
  2: { mode: "hanzi-to-meaning" },
  3: { mode: "hanzi-to-hanzi" }
};

// =====================
// GAME CONTROLLER
// =====================
const GameController = {
  lang: "en",
  showPinyin: true,
  vocab: [],

  init(settings, vocab) {
    this.lang = settings.lang;
    this.showPinyin = settings.pinyin;
    this.vocab = vocab;
  },

  getMeaning(word) {
    return word.meaning[this.lang];
  }
};

// =====================
// DOM READY
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    Settings.load();
    UI.init();
    await loadVocabList();

    const params = new URLSearchParams(window.location.search);
    currentGame = Number(params.get("game")) || Number(localStorage.getItem("lastGame")) || 2;

    const vocabKey =
      params.get("vocab") ||
      localStorage.getItem("lastVocab") ||
      UI.vocabSelect.options[0].value;

    UI.setActiveGameBtn(currentGame);
    UI.vocabSelect.value = vocabKey;

    selectedVocab = await loadVocabFile(vocabKey);

    UI.btnStartGame.onclick = async () => {
      usedWords.clear();
      selectedVocab = await loadVocabFile(UI.vocabSelect.value);
      localStorage.setItem("lastGame", currentGame);
      localStorage.setItem("lastVocab", UI.vocabSelect.value);
      startGame(currentGame, selectedVocab);
    };

    if (params.size) startGame(currentGame, selectedVocab);
    else UI.showMenu();

  } catch {
    alert("Failed to load vocabulary");
  }
});

// =====================
// START GAME
// =====================
function startGame(gameNumber, vocab) {
  UI.hideMenu();
  currentPlayer = 1;
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  const gameDef = GAMES[gameNumber];
  if (!gameDef) return;

  // 🔥 Game unificado
  window.Game = {
    mode: gameDef.mode,
    vocab,
    getQuestion() {
      if (!this.vocab.length) return null;
      return this.vocab[Math.floor(Math.random() * this.vocab.length)];
    }
  };

  GameController.init(
    { lang: Settings.data.lang, pinyin: Settings.data.pinyin },
    vocab
  );

  loadQuestion();
  startTimer();
}

// =====================
// LOAD QUESTION
// =====================
function loadQuestion() {
  currentQuestion = window.Game.getQuestion();
  if (!currentQuestion) return;

  const type = getGameTypeByMode(window.Game.mode);

  let options, correct;
  switch (type.options) {
    case "pinyin":
      options = generatePinyinOptions(currentQuestion);
      correct = currentQuestion.pinyin;
      break;
    case "hanzi":
      options = generateHanziOptions(currentQuestion);
      correct = currentQuestion.hanzi;
      break;
    case "meaning":
      options = generateMeaningOptions(currentQuestion);
      correct = GameController.getMeaning(currentQuestion);
      break;
  }

  let questionText;
  switch (type.question) {
    case "hanzi":   questionText = renderHanzi(currentQuestion); break;
    case "meaning": questionText = GameController.getMeaning(currentQuestion); break;
    case "pinyin":  questionText = currentQuestion.pinyin; break;
  }

  UI.renderQuestion(
    currentPlayer,
    questionText,
    options,
    sel => onAnswer(sel, correct)
  );
}

// =====================
// GAME MODE MAP
// =====================
function getGameTypeByMode(mode) {
  return {
    "hanzi-to-meaning": GAME_TYPES.meaning,
    "hanzi-to-hanzi":   GAME_TYPES.word,
    "hanzi-to-pinyin":  GAME_TYPES.pinyin
  }[mode];
}

// =====================
// OPTIONS
// =====================
function generateHanziOptions(word) {
  const pool = window.Game.vocab
    .filter(w => w.hanzi !== word.hanzi)
    .map(w => w.hanzi);
  return shuffleArray([word.hanzi, ...pool.slice(0, 3)]);
}

function generatePinyinOptions(word) {
  const pool = window.Game.vocab
    .filter(w => w.pinyin !== word.pinyin)
    .map(w => w.pinyin);
  return shuffleArray([word.pinyin, ...pool.slice(0, 3)]);
}

function generateMeaningOptions(word) {
  const correct = GameController.getMeaning(word);
  const pool = window.Game.vocab
    .map(w => GameController.getMeaning(w))
    .filter(m => m !== correct);
  return shuffleArray([correct, ...pool.slice(0, 3)]);
}

// =====================
// HELPERS
// =====================
function shuffleArray(a) {
  return a.sort(() => Math.random() - 0.5);
}

function renderHanzi(word) {
  return Settings.data.pinyin
    ? `${word.hanzi} <span class="pinyin">[${word.pinyin}]</span>`
    : word.hanzi;
}
