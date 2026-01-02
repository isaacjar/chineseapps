import { Settings } from "./settings.js";
import { Game, enableKeyboardInput } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";

/* =========================
   SETTINGS
========================= */
const params = new URLSearchParams(location.search);
Settings.init(params);

/* =========================
   DOM ELEMENTS
========================= */
const board = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");
const btnStart = document.getElementById("btnStart");
const memBar = document.querySelector(".mem-bar");
const memProgress = document.querySelector(".mem-progress");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = [];
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;

let running = false;
let memPhase = false;
let memInterval = null;
let roundInterval = null;

let memTimeLeft = Settings.data.timemem;
let roundTimeLeft = Settings.data.time;
let roundStartTime = null;
let score = 0;
let correctIndices = []; // índices acertados en esta ronda
let orderRandom = Settings.data.showOrdered !== true;

/* =========================
   VOCABULARY SOURCES
========================= */
const VOC_SOURCES = {
  zh:{index:"https://isaacjar.github.io/chineseapps/voclists/index.js",base:"https://isaacjar.github.io/chineseapps/voclists/"},
  es:{index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"},
  en:{index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"}
};

/* =========================
   LOAD VOCABULARY
========================= */
async function loadIndex(lang){
  const url = VOC_SOURCES[lang].index;
  if(lang === "zh"){
    const txt = await fetch(url).then(r => r.text());
    return Function(txt + "; return voclists;")();
  } else {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`No se pudo cargar ${url}`);
    return await res.json();
  }
}

async function loadVoclist(lang, filename){
  const base = VOC_SOURCES[lang].base;
  const url = lang === "zh" ? `${base}${filename}.json` : `${base}${filename}`;
  const list = await fetch(url).then(r => r.json());
  vocabRaw = list;
  return lang === "zh" ? list.map(w => w.ch) : list.map(w => w[lang]);
}

/* =========================
   SELECT VOCABULARY
========================= */
async function selectVocabulary(){
  const lists = await loadIndex(currentLang);
  if(params.get("voclist")){
    vocab = await loadVoclist(currentLang, params.get("voclist"));
    resetGame();
    return;
  }
  showVoclistPopup(lists, async l => {
    vocab = await loadVoclist(currentLang, l.filename);
    resetGame();
  });
}

/* =========================
   HELPERS
========================= */
function formatWord(word){
  if(currentLang !== "zh") return word;
  const obj = vocabRaw.find(w => w.ch === word);
  if(!obj) return word;
  return Settings.data.showPinyin ? `${obj.ch}\n${obj.pin}` : obj.ch;
}

/* =========================
   BOARD LAYOUT
========================= */
function adjustBoardLayout(){
  const n = Settings.data.numwords;
  let cols = n <= 6 ? 3 : n <= 12 ? 4 : n <= 20 ? 5 : 6;
  board.style.gridTemplateColumns = `repeat(${cols},1fr)`;

  const rows = Math.ceil(n / cols);
  const maxHeight = Math.min(420, board.clientWidth / cols * 1.1);
  const btnHeight = Math.floor(maxHeight / rows * 1.75);
  [...board.children].forEach(b => b.style.height = `${Math.min(btnHeight,350)}px`);
}

/* =========================
   GAME FLOW
========================= */
function resetGame(){
  running = false;
  memPhase = false;
  score = 0;
  memTimeLeft = Settings.data.timemem;
  roundTimeLeft = Settings.data.time;
  roundStartTime = null;
  correctIndices = [];

  UI.renderBoard(board, Settings.data.numwords);
  adjustBoardLayout();
  wordBox.textContent = "";
  timerEl.textContent = "";
  if(memBar) memBar.style.width = "0%";
  if(btnStart) btnStart.textContent = "START";
  if(disableKeyboard){ disableKeyboard(); disableKeyboard = null; }
}

function startMemPhase(resumeTime){
  memPhase = true;
  btnStart.textContent = "PAUSE";

  if(!memInterval){
    Game.start(vocab, Settings.data.numwords);
    let words = [...Game.active];
    if(orderRandom) words.sort(() => Math.random() - 0.5);

    UI.renderBoard(board, Settings.data.numwords);
    adjustBoardLayout();
    UI.showWords(board, words.map(formatWord));
  }

  memTimeLeft = resumeTime ?? memTimeLeft;
  const total = Settings.data.timemem;
  if(memProgress) memProgress.classList.add("active");

  memInterval = setInterval(() => {
    if(!running) return;
    memTimeLeft--;
    timerEl.textContent = `Mem: ${memTimeLeft}s`;
    if(memBar) memBar.style.width = `${((total - memTimeLeft)/total)*100}%`;

    if(memTimeLeft <= 0){
      clearInterval(memInterval);
      memInterval = null;
      memPhase = false;
      UI.showNumbers(board);
      adjustBoardLayout();
      if(memBar) memBar.style.width = "0%";
      startRoundPhase();
    }
  },1000);
}

function startRoundPhase(resumeTime){
  if(Game.active.length === 0) return;
  roundTimeLeft = resumeTime ?? roundTimeLeft;
  roundStartTime = Date.now();

  if(roundInterval) clearInterval(roundInterval);
  roundInterval = setInterval(() => {
    if(!running) return;
    roundTimeLeft--;
    if(roundTimeLeft <= 0){
      clearInterval(roundInterval);
      roundInterval = null;
      endGame(false);
    }
    const mins = Math.floor(roundTimeLeft/60);
    const secs = roundTimeLeft % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2,"0")}`;
  },1000);

  nextQuestion();
}

function nextQuestion(){
  if(Game.isFinished(correctIndices)) return endGame(true);

  // Elegir índice aleatorio de palabras restantes
  const idx = Game.pickRandomTarget(correctIndices);
  if(idx === null) return endGame(true);

  Game.targetIndex = idx;
  const word = Game.active[idx];
  wordBox.textContent = formatWord(word);

  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase || !running) return;
  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn || btn.classList.contains("disabled")) return;

  if(Game.check(index)){
    correctIndices.push(index);
    const word = Game.active[index];
    UI.markCorrect(btn, word, Settings.data.showPinyin, vocabRaw);
    nextQuestion();
  } else {
    UI.markWrong(board);
    setTimeout(() => {
      resetGame();
      startMemPhase(memTimeLeft);
    },900);
  }
}

function endGame(victory){
  running = false;
  clearInterval(roundInterval);
  roundInterval = null;

  if(victory){
    const timeLeft = roundTimeLeft;
    score = Math.floor(timeLeft*10); // puntuación ejemplo
    Settings.data.stats.played++;
    Settings.data.stats.won++;
    Settings.save();
    UI.showVictoryPopup(score, () => resetGame());
  } else {
    Settings.data.stats.played++;
    Settings.save();
    resetGame();
  }
}

/* =========================
   CLICK HANDLER
========================= */
board.onclick = e => {
  if(!e.target.dataset.index) return;
  handleAnswer(Number(e.target.dataset.index));
};

/* =========================
   START / PAUSE / RESUME
========================= */
if(btnStart){
  btnStart.onclick = () => {
    if(!running){
      running = true;
      btnStart.textContent = "PAUSE";
      if(memPhase) startMemPhase(memTimeLeft);
      else if(roundStartTime) startRoundPhase(roundTimeLeft);
      else startMemPhase(memTimeLeft);
    } else {
      running = false;
      btnStart.textContent = "RESUME";
    }
  };
}

/* =========================
   INIT
========================= */
selectVocabulary();
