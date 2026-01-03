// app.js

import { Settings } from "./settings.js";
import { Game, enableKeyboardInput } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";

/* =========================
   SETTINGS
========================= */
const params = new URLSearchParams(location.search);
Settings.init(params);

document.addEventListener("DOMContentLoaded", () => {
  const btnSettings = document.getElementById("btnSettings");
  if (btnSettings) {
    btnSettings.onclick = () => showSettingsPopup(() => location.reload());
  }
});

/* =========================
   DOM
========================= */
const board = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");
const btnStart = document.getElementById("btnStart");
const memBar = document.querySelector(".mem-bar");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = [];
let currentLang = Settings.data.lang || "zh";

let running = false;
let memPhase = false;

let disableKeyboard = null;

let memInterval = null;
let roundInterval = null;

let memTimeLeft = Settings.data.timemem;
let roundTimeLeft = Settings.data.time;

let score = 0;

// 🔀 solo afecta a preguntas
const orderRandom = Settings.data.orderRandom === true;

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
  let url;

  if(lang === "zh"){
    url = `${base}${filename}.json`;
    const list = await fetch(url).then(r => r.json());
    vocabRaw = list;
    return list.map(w => w.ch);
  } else {
    url = `${base}${filename}`;
    const list = await fetch(url).then(r => r.json());
    vocabRaw = list;
    return list.map(w => w[lang]);
  }
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
   BOARD AUTO LAYOUT
========================= */
function adjustBoardLayout(){
  const n = Settings.data.numwords;

  let cols;
  if(n <= 6) cols = 3;
  else if(n <= 9) cols = 3;
  else if(n <= 12) cols = 4;
  else if(n <= 16) cols = 4;
  else if(n <= 20) cols = 5;
  else cols = 6;

  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const rows = Math.ceil(n / cols);
  const maxHeight = Math.min(420, board.clientWidth / cols * 1.1);
  const btnHeight = Math.floor(maxHeight / rows * 1.75);

  [...board.children].forEach(btn => {
    btn.style.height = `${Math.min(btnHeight,350)}px`;
  });
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

  clearInterval(memInterval);
  clearInterval(roundInterval);
  memInterval = null;
  roundInterval = null;

  UI.renderBoard(board, Settings.data.numwords);
  adjustBoardLayout();

  wordBox.textContent = "";
  timerEl.textContent = "";
  if(memBar) memBar.style.width = "0%";

  btnStart.textContent = "START";

  if(disableKeyboard){
    disableKeyboard();
    disableKeyboard = null;
  }
}

function startMemPhase(){
  memPhase = true;
  btnStart.textContent = "PAUSE";

  Game.start(vocab, Settings.data.numwords);

  UI.renderBoard(board, Settings.data.numwords);
  adjustBoardLayout();
  UI.showWords(board, Game.active.map(formatWord));

  const total = Settings.data.timemem;

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
      startRoundPhase();
    }
  },1000);
}

function startRoundPhase(){
  if(Game.active.length === 0) return;

  if(roundInterval) clearInterval(roundInterval);

  roundInterval = setInterval(() => {
    if(!running) return;

    roundTimeLeft--;
    if(roundTimeLeft <= 0){
      clearInterval(roundInterval);
      endGame(false);
    }

    const mins = Math.floor(roundTimeLeft/60);
    const secs = roundTimeLeft % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2,"0")}`;
  },1000);

  nextQuestion();
}

function nextQuestion(){
  if(Game.isFinished()) return endGame(true);

  const remaining = Game.getRemainingIndices(orderRandom);
  if(!remaining.length) return;
  const idx = remaining[0];
   
  Game.targetIndex = idx;
  wordBox.textContent = formatWord(Game.active[idx]);

  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase || !running) return;

  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn || btn.classList.contains("disabled")) return;

  if(Game.check(index)){
    UI.markCorrect(btn, Game.active[index], Settings.data.showPinyin, vocabRaw);
    nextQuestion();
  } else {
     UI.markWrong(board);
   
     setTimeout(() => {
       UI.showNumbers(board);
       Game.resetProgress();
       Game.buildSequence(orderRandom);
       nextQuestion();
     }, 700);
   }

}

function endGame(victory){
  running = false;
  clearInterval(roundInterval);

  if(victory){
    score = Math.floor(roundTimeLeft * 10);
    Settings.data.stats.played++;
    Settings.data.stats.won++;
    Settings.save();
    UI.showVictoryPopup(score, resetGame);
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
   START / PAUSE
========================= */
btnStart.onclick = () => {
  if(!running){
    running = true;
    btnStart.textContent = "PAUSE";
    if(memPhase) return;
    if(roundInterval) return;
    startMemPhase();
  } else {
    running = false;
    btnStart.textContent = "RESUME";
  }
};

/* =========================
   INIT
========================= */
selectVocabulary();
