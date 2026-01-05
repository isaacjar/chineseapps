// app.js

import { Settings } from "./settings.js";
import { Game, enableKeyboardInput } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";

/* =========================
   SETTINGS
========================= */
const params = new URLSearchParams(location.search);
Settings.init(params);

/* =========================
   DOM
========================= */
const board = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");
const btnStart = document.getElementById("btnStart");
const btnNew = document.getElementById("btnNew");
const memBar = document.querySelector(".mem-bar");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = [];
let currentLang = Settings.data.lang || "zh";

let running = false;
let memPhase = false;

let memInterval = null;
let roundInterval = null;

let memTimeLeft = Settings.data.timemem;
let roundTimeLeft = Settings.data.time;

let disableKeyboard = null;

// 🔀 SOLO preguntas
const orderRandom = Settings.data.orderRandom === true;

/* =========================
   VOCAB SOURCES
========================= */
const VOC_SOURCES = {
  zh:{
    index:"https://isaacjar.github.io/chineseapps/voclists/index.js",
    base:"https://isaacjar.github.io/chineseapps/voclists/",
    type:"js"
  },
  es:{
    index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/",
    type:"js"
  },
  en:{
    index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/",
    type:"js"
  }
};

/* =========================
   LOAD VOCAB
========================= */
async function loadIndex(lang){
  const src = VOC_SOURCES[lang];
  if(!src) throw new Error("Idioma no soportado: " + lang);

  // index.js (JS real)
  if(src.type === "js"){
    const txt = await fetch(src.index).then(r => r.text());

    return Function(
      txt
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+default\s+/g, "") +
      "; return voclists;"
    )();
  }

  // JSON puro (por si algún día lo usas)
  return await fetch(src.index).then(r => r.json());
}

async function loadVoclist(lang, filename){
  const base = VOC_SOURCES[lang].base;
  const url = lang === "zh"
    ? `${base}${filename}.json`
    : `${base}${filename}`;

  const res = await fetch(url);
  if(!res.ok) throw new Error("No se pudo cargar vocabulario");
  const list = await res.json();
   
  vocabRaw = list;

  return lang === "zh"
    ? list.map(w => w.ch)
    : list.map(w => w[lang]);
}

/* =========================
   SELECT VOCAB
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
  return Settings.data.showPinyin ? `${obj.ch}\n${obj.pin}` : obj.ch;
}

function formatTime(sec){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2,"0")}`;
}

/* =========================
   BOARD LAYOUT
========================= */
function adjustBoardLayout(){
  const n = Settings.data.numwords;
  let cols = n <= 6 ? 3 : n <= 9 ? 3 : n <= 12 ? 4 : n <= 16 ? 4 : n <= 20 ? 5 : 6;
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const rows = Math.ceil(n / cols);
  const maxHeight = Math.min(420, board.clientWidth / cols * 1.1);
  const btnHeight = Math.floor(maxHeight / rows * 1.75);

  [...board.children].forEach(btn => {
    btn.style.height = `${Math.min(btnHeight,350)}px`;
  });
}

/* =========================
   RESET
========================= */
function resetGame(){
  running = false;
  memPhase = false;

  memTimeLeft = Settings.data.timemem;
  roundTimeLeft = Settings.data.time;

  clearInterval(memInterval);
  clearInterval(roundInterval);
  memInterval = roundInterval = null;

  UI.renderBoard(board, Settings.data.numwords);
  board.style.visibility = "hidden";

  wordBox.textContent = "";
  timerEl.textContent = "Pulsa START para comenzar el juego...";
  if(memBar) memBar.style.width = "0%";

  btnStart.textContent = "START";

  if(disableKeyboard){
    disableKeyboard();
    disableKeyboard = null;
  }
}

/* =========================
   MEM PHASE
========================= */
function startMemPhase(){
  memPhase = true;
  board.style.visibility = "visible";

  Game.start(vocab, Settings.data.numwords);

  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, Game.active.map(formatWord));
  adjustBoardLayout();

  btnStart.textContent = "PAUSE";

  memInterval = setInterval(() => {
    if(!running) return;

    memTimeLeft--;
    timerEl.textContent = `Memoriza estas palabras (${formatTime(memTimeLeft)})`;

    if(memBar){
      const total = Settings.data.timemem;
      memBar.style.width = `${((total - memTimeLeft)/total)*100}%`;
    }

    if(memTimeLeft <= 0){
      clearInterval(memInterval);
      memInterval = null;
      memPhase = false;

      UI.showNumbers(board);
      requestAnimationFrame(adjustBoardLayout);

      timerEl.textContent = "¡Comenzamos! Selecciona el número de la palabra...";
      setTimeout(startRoundPhase, 2000);
    }
  },1000);
}

/* =========================
   ROUND PHASE
========================= */
function startRoundPhase(){
  Game.buildSequence(orderRandom);

  roundInterval = setInterval(() => {
    if(!running) return;

    roundTimeLeft--;
    timerEl.textContent = formatTime(roundTimeLeft);

    if(roundTimeLeft <= 0){
      endGame(false);
    }
  },1000);

  nextQuestion();
}

function nextQuestion(){
  if(Game.isFinished()) return endGame(true);

  const idx = Game.nextTarget();
  wordBox.textContent = formatWord(Game.active[idx]);

  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(
    Settings.data.numwords,
    handleAnswer
  );
}

/* =========================
   ANSWER
========================= */
function handleAnswer(index){
  if(memPhase || !running) return;

  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn || btn.classList.contains("disabled")) return;

  if(Game.check(index)){
    UI.markCorrect(btn, Game.active[index], Settings.data.showPinyin, vocabRaw);
    nextQuestion();
  } else {
    UI.markSingleWrong(btn, Game.active[index], Settings.data.showPinyin, vocabRaw);

    setTimeout(() => {
      UI.showNumbers(board);
      Game.resetProgress();
      if(orderRandom) Game.buildSequence(true);
      nextQuestion();
    }, 1000);
  }
}

/* =========================
   END GAME
========================= */
function endGame(victory){
  running = false;
  clearInterval(roundInterval);

  if(victory){
    const score = Math.floor(roundTimeLeft * 10);
    UI.showVictoryPopup(score, resetGame);
  } else {
    UI.showLosePopup("¡Se acabó el tiempo!", resetGame, "Otra partida");
  }
}

/* =========================
   EVENTS
========================= */
board.onclick = e => {
  if(e.target.dataset.index){
    handleAnswer(Number(e.target.dataset.index));
  }
};

btnStart.onclick = () => {
  if(!running){
    running = true;
    startMemPhase();
  } else {
    running = false;
    btnStart.textContent = "RESUME";
  }
};

btnNew.onclick = () => {
  if(!running){
    resetGame();
    return;
  }

  running = false;
  if(confirm("¿Desea terminar la partida en curso?")){
    resetGame();
  } else {
    running = true;
  }
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const btnSettings = document.getElementById("btnSettings");
  if (btnSettings) {
    btnSettings.onclick = () => showSettingsPopup(() => location.reload());
  }
});

selectVocabulary();
