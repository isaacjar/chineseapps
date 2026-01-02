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
const memProgress = document.querySelector(".mem-progress");
const memBar = document.querySelector(".mem-bar");
const btnStart = document.getElementById("btnStart");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = [];
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;
let memPhase = false;
let orderRandom = Settings.data.showOrdered !== true;
let gameState = "idle"; // idle | mem | play
let memInterval, roundInterval;

/* =========================
   VOCABULARY SOURCES
========================= */
const VOC_SOURCES = {
  zh: { index: "https://isaacjar.github.io/chineseapps/voclists/index.js", base: "https://isaacjar.github.io/chineseapps/voclists/" },
  es: { index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js", base: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/" },
  en: { index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js", base: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/" }
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

/* =========================
   SELECT VOCABULARY
========================= */
async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  if(params.get("voclist")){
    vocab = await loadVoclist(currentLang, params.get("voclist"));
    return;
  }

  showVoclistPopup(lists, async l => {
    vocab = await loadVoclist(currentLang, l.filename);
  });
}

/* =========================
   HELPERS
========================= */
function formatWord(word){
  if(currentLang !== "zh") return word;
  const obj = vocabRaw.find(w => w.ch === word);
  if(!obj) return word;
  if(Settings.data.showPinyin) return `${obj.ch}\n${obj.pin}`;
  return obj.ch;
}

function resetBoard(){
  UI.renderBoard(board, 0);
  wordBox.textContent = "";
  timerEl.textContent = "";
  memBar.style.width = "0%";
  memProgress.classList.remove("active");
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }
}

/* =========================
   GAME FLOW
========================= */
function startRound(){
  gameState = "play";
  let totalTime = Settings.data.time;

  roundInterval = setInterval(()=>{
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
  wordBox.textContent = formatWord(word);
  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase || gameState!=="play") return;
  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  const targetWord = Game.active[Game.targetIndex];
  if(Game.check(index)){
    btn.classList.add("correct");
    wordBox.textContent = formatWord(targetWord);
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);
    new Audio("./sounds/correct.mp3").play();
    setTimeout(()=>{ btn.classList.remove("correct"); nextQuestion(); },800);
  }else{
    btn.classList.add("wrong");
    UI.toast("❌ Fallaste");
    new Audio("./sounds/wrong.mp3").play();
    setTimeout(()=>{ btn.classList.remove("wrong"); resetBoard(); gameState="idle"; },800);
  }
}

/* =========================
   START / PAUSE BUTTON
========================= */
btnStart.onclick = async ()=>{
  if(gameState==="play" || gameState==="mem"){
    // PAUSE
    resetBoard();
    gameState="idle";
    btnStart.textContent="START";
  }else{
    // START
    if(vocab.length===0) await selectVocabulary();
    gameState="mem";
    memPhase=true;
    Game.start(vocab, Settings.data.numwords);
    let words = [...Game.active];
    if(orderRandom) words.sort(()=>Math.random()-0.5);

    UI.renderBoard(board, Settings.data.numwords);
    UI.showWords(board, words.map(formatWord));
    memProgress.classList.add("active");
    memBar.style.width="0%";

    btnStart.disabled=true;
    let t = Settings.data.timemem;
    const memStep = 100/t;

    memInterval = setInterval(()=>{
      t--;
      timerEl.textContent = `Mem: ${t}s`;
      memBar.style.width = `${((Settings.data.timemem - t)/Settings.data.timemem)*100}%`;
      if(t<=0){
        clearInterval(memInterval);
        memPhase=false;
        memProgress.classList.remove("active");
        UI.showNumbers(board);
        btnStart.disabled=false;
        btnStart.textContent="PAUSE";
        startRound();
      }
    },1000);
  }
};

/* =========================
   CLICK HANDLER
========================= */
board.onclick = e => {
  if(!e.target.dataset.index) return;
  handleAnswer(Number(e.target.dataset.index));
};

/* =========================
   INIT
========================= */
resetBoard();
btnStart.textContent="START";
