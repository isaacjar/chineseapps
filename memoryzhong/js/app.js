// app.js

import { Settings } from "./settings.js";
import { Game, enableKeyboardInput } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";

/* =========================
   SETTINGS
========================= */
const params = new URLSearchParams(location.search);
Settings.init(params);

document.getElementById("btnSettings").onclick = () => {
  showSettingsPopup(() => location.reload());
};

/* =========================
   DOM
========================= */
const board = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = []; // ← objetos completos (ch + pin)
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;
let memPhase = false;
let orderRandom = Settings.data.showOrdered !== true;

/* =========================
   VOCABULARY SOURCES
========================= */
const VOC_SOURCES = {
  zh: {
    index: "https://isaacjar.github.io/chineseapps/voclists/index.js",
    base: "https://isaacjar.github.io/chineseapps/voclists/"
  },
  es: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  },
  en: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  }
};

/* =========================
   LOAD VOCABULARY
========================= */
async function loadIndex(lang){
  const url = VOC_SOURCES[lang].index;
  if(lang === "zh"){
    const txt = await fetch(url).then(r => r.text());
    return Function(txt + "; return voclists;")();
  }else{
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
  }else{
    url = `${base}${filename}`;
    const list = await fetch(url).then(r => r.json());
    vocabRaw = list;
    return list.map(w => w[lang]);
  }
}

async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  if(params.get("voclist")){
    vocab = await loadVoclist(currentLang, params.get("voclist"));
    startGame();
    return;
  }

  showVoclistPopup(lists, async l => {
    vocab = await loadVoclist(currentLang, l.filename);
    startGame();
  });
}

/* =========================
   HELPERS
========================= */
function formatWord(word){
  if(currentLang !== "zh") return word;

  const obj = vocabRaw.find(w => w.ch === word);
  if(!obj) return word;

  if(Settings.data.showPinyin){
    return `${obj.ch}\n${obj.pin}`;
  }
  return obj.ch;
}

/* =========================
   GAME FLOW
========================= */
function startGame(){
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }
  memPhase = true;

  Game.start(vocab, Settings.data.numwords);
  let words = [...Game.active];
  if(orderRandom) words.sort(() => Math.random() - 0.5);

  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, words.map(formatWord));

  let t = Settings.data.timemem;
  timerEl.textContent = `Mem: ${t}s`;

  const memInterval = setInterval(() => {
    t--;
    timerEl.textContent = `Mem: ${t}s`;
    if(t <= 0){
      clearInterval(memInterval);
      memPhase = false;
      UI.showNumbers(board);
      startRound();
    }
  }, 1000);
}

function startRound(){
  let totalTime = Settings.data.time;
  const roundInterval = setInterval(() => {
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2,'0')}`;
    totalTime--;
    if(totalTime < 0) clearInterval(roundInterval);
  }, 1000);
  nextQuestion();
}

function nextQuestion(){
  const word = Game.pickTarget();
  wordBox.textContent = formatWord(word);

  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase) return;

  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  const targetWord = Game.active[Game.targetIndex];

  if(Game.check(index)){
    btn.classList.add("correct");
    wordBox.textContent = formatWord(targetWord);
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);
    new Audio("./sounds/correct.mp3").play();

    setTimeout(() => {
      btn.classList.remove("correct");
      nextQuestion();
    }, 800);
  }else{
    btn.classList.add("wrong");
    UI.toast("❌ Fallaste");
    new Audio("./sounds/wrong.mp3").play();

    setTimeout(() => {
      btn.classList.remove("wrong");
      startGame();
    }, 800);
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
   START
========================= */
selectVocabulary();
