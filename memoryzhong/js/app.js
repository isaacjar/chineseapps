// app.js

import { Settings } from "./settings.js";
import { Game, enableKeyboardInput } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";

/* =========================
   SETTINGS
========================= */
const params = new URLSearchParams(location.search);
Settings.init(params);

document.getElementById("btnSettings").onclick = ()=>{
  showSettingsPopup(()=>{ location.reload(); });
};

/* =========================
   DOM
========================= */
const board   = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");

/* =========================
   STATE
========================= */
let vocab = [];
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;
let memPhase = false;
let orderRandom = false;

/* =========================
   VOCABULARY SOURCES
========================= */
const VOC_SOURCES = {
  zh:{ index:"https://isaacjar.github.io/chineseapps/voclists/index.js", base:"https://isaacjar.github.io/chineseapps/voclists/" },
  es:{ index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js", base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/" },
  en:{ index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js", base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/" }
};

/* =========================
   LOAD VOCABULARY
========================= */
async function loadIndex(lang){
  const res = await fetch(VOC_SOURCES[lang].index);
  if(!res.ok) throw new Error(`No se pudo cargar ${VOC_SOURCES[lang].index}`);
  const txt = await res.text();
  return Function(txt + "; return voclists;")();
}

async function loadVoclist(lang, filename){
  let url;
  if(lang === "zh"){
    url = `${VOC_SOURCES[lang].base}${filename}.json`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`No se pudo cargar ${url}`);
    const list = await res.json();
    return list.map(w=>w.ch).filter(Boolean);
  } else {
    url = `${VOC_SOURCES[lang].base}${filename}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`No se pudo cargar ${url}`);
    const list = await res.json();
    return list.map(w=>w[lang]).filter(Boolean);
  }
}

async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  if(params.get("voclist")){
    vocab = await loadVoclist(currentLang, params.get("voclist"));
    startGame();
    return;
  }

  showVoclistPopup(lists, async l=>{
    vocab = await loadVoclist(currentLang, l.filename);
    startGame();
  });
}

/* =========================
   GAME FLOW
========================= */
function startGame(){
  // 🔒 bloquear teclado previo
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }
  memPhase = true;

  Game.start(vocab, Settings.data.numwords);
  let words = [...Game.active];
  if(orderRandom) words.sort(()=>Math.random()-0.5);

  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, words);

  let t = Settings.data.timemem;
  timerEl.textContent = `Mem: ${t}s`;

  const memInterval = setInterval(()=>{
    t--;
    timerEl.textContent = `Mem: ${t}s`;
    if(t<=0){
      clearInterval(memInterval);
      memPhase=false;
      UI.showNumbers(board);
      startRound();
    }
  },1000);
}

function startRound(){
  let totalTime = Settings.data.time;
  const roundInterval = setInterval(()=>{
    const mins = Math.floor(totalTime/60);
    const secs = totalTime%60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2,'0')}`;
    totalTime--;
    if(totalTime<0) clearInterval(roundInterval);
  },1000);
  nextQuestion();
}

function nextQuestion(){
  const word = Game.pickTarget();
  wordBox.textContent = word;
  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase) return; // bloquear input durante memorización
  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  if(Game.check(index)){
    btn.classList.add("correct");
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);
    const audio = new Audio("./sounds/correct.mp3");
    audio.play();
    setTimeout(()=>{btn.classList.remove("correct"); nextQuestion();},300);
  } else {
    btn.classList.add("wrong");
    UI.toast("❌ Fallaste");
    const audio = new Audio("./sounds/wrong.mp3");
    audio.play();
    setTimeout(()=>{btn.classList.remove("wrong"); startGame();},600);
  }
}

/* =========================
   CLICK HANDLER
========================= */
board.onclick = e=>{
  if(!e.target.dataset.index) return;
  handleAnswer(Number(e.target.dataset.index));
};

/* =========================
   START
========================= */
selectVocabulary();
