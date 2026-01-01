// app.js
import { Settings } from "./settings.js";
import { Game } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup, enableKeyboardInput } from "./ui.js";
import { loadVoclist } from "./vocloader.js";

/* =========================
   GLOBAL STATE
========================= */

let vocab = [];
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;
let inputEnabled = false;
let gameTimer = null;
let timeLeft = 0;

/* =========================
   SOUNDS
========================= */

const sndOk  = new Audio("https://isaacjar.github.io/chineseapps/memoryzhong/sound/correct.mp3");
const sndBad = new Audio("https://isaacjar.github.io/chineseapps/memoryzhong/sound/wrong.mp3");

/* =========================
   DOM
========================= */

const board   = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");

/* =========================
   SETTINGS INIT
========================= */

const params = new URLSearchParams(location.search);
Settings.init(params);

document.getElementById("btnSettings").onclick = ()=>{
  showSettingsPopup(()=>location.reload());
};

/* =========================
   VOCABULARY
========================= */

const VOC_SOURCES = {
  zh:{index:"https://isaacjar.github.io/chineseapps/voclists/index.js",base:"https://isaacjar.github.io/chineseapps/voclists/"},
  es:{index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"},
  en:{index:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",base:"https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"}
};

async function loadIndex(lang){
  const txt = await fetch(VOC_SOURCES[lang].index).then(r=>r.text());
  return Function(txt + "; return voclists;")();
}

async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  if(params.get("voclist")){
    const ext = currentLang === "zh" ? ".json" : "";
    vocab = await loadVoclist(`${VOC_SOURCES[currentLang].base}${params.get("voclist")}${ext}`);
    startGame();
    return;
  }

  showVoclistPopup(lists, async l=>{
    const ext = currentLang === "zh" ? ".json" : "";
    vocab = await loadVoclist(`${VOC_SOURCES[currentLang].base}${l.filename}${ext}`);
    startGame();
  });
}

/* =========================
   GAME FLOW
========================= */

function startGame(){
  clearInterval(gameTimer);
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }

  inputEnabled = false;

  Game.start(vocab, Settings.data.numwords);

  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, Game.active);

  // memorización
  let t = Settings.data.timemem;
  timerEl.textContent = t;

  const memInterval = setInterval(()=>{
    t--;
    timerEl.textContent = t;
    if(t <= 0){
      clearInterval(memInterval);
      startCountdown();
    }
  },1000);
}

/* =========================
   3-2-1 START
========================= */

function startCountdown(){
  let c = 3;
  wordBox.textContent = c;

  const cd = setInterval(()=>{
    c--;
    if(c > 0){
      wordBox.textContent = c;
    }else{
      clearInterval(cd);
      wordBox.textContent = "START!";
      beginPlay();
    }
  },800);
}

/* =========================
   GAME START
========================= */

function beginPlay(){
  UI.showNumbers(board);
  inputEnabled = true;
  startGameTimer();
  nextQuestion();
}

/* =========================
   TIMER
========================= */

function startGameTimer(){
  timeLeft = Settings.data.time;
  updateTimer();

  gameTimer = setInterval(()=>{
    timeLeft--;
    updateTimer();
    if(timeLeft <= 0){
      clearInterval(gameTimer);
      endGame(false);
    }
  },1000);
}

function updateTimer(){
  const m = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const s = String(timeLeft%60).padStart(2,"0");
  timerEl.textContent = `${m}:${s}`;
}

/* =========================
   QUESTIONS
========================= */

function nextQuestion(){
  const word = Game.pickTarget();
  wordBox.textContent = word;

  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(!inputEnabled) return;

  const btn = board.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  if(Game.check(index)){
    sndOk.currentTime=0; sndOk.play();
    btn.classList.add("correct");
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);
    setTimeout(()=>{btn.classList.remove("correct"); nextQuestion();},300);
  }else{
    sndBad.currentTime=0; sndBad.play();
    btn.classList.add("wrong");
    UI.toast("❌ Fallaste");
    setTimeout(()=>{btn.classList.remove("wrong"); startGame();},600);
  }
}

/* =========================
   CLICK
========================= */

board.onclick = e=>{
  if(!inputEnabled) return;
  const idx = e.target.dataset.index;
  if(idx!==undefined) handleAnswer(Number(idx));
};

/* =========================
   END
========================= */

function endGame(win){
  inputEnabled = false;
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }
  UI.toast(win ? "🏆 ¡Victoria!" : "⏱️ Tiempo agotado");
}

/* =========================
   START APP
========================= */

selectVocabulary();
