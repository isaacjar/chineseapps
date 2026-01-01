// app.js
import { Settings } from "./settings.js";
import { Game } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup } from "./ui.js";
import { loadVoclist } from "./vocloader.js";

/* =========================
   SETTINGS
========================= */

const params = new URLSearchParams(location.search);
Settings.init(params);

document.getElementById("btnSettings").onclick = ()=>{
  showSettingsPopup(()=> location.reload());
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
let keyboardEnabled = false;

/* =========================
   VOCABULARY SOURCES
========================= */

const VOC_SOURCES = {
  zh: {
    index: "https://isaacjar.github.io/chineseapps/voclists/index.json",
    base:  "https://isaacjar.github.io/chineseapps/voclists/"
  },
  es: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index",
    base:  "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  },
  en: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index",
    base:  "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  }
};

/* =========================
   LOAD INDEX
========================= */

async function loadIndex(lang){
  const res = await fetch(VOC_SOURCES[lang].index);
  return JSON.parse(await res.text());
}

/* =========================
   SELECT VOCABULARY
========================= */

async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  if(params.get("voclist")){
    vocab = await loadVoclist(
      VOC_SOURCES[currentLang].base + params.get("voclist")
    );
    startGame();
    return;
  }

  showVoclistPopup(lists, async l=>{
    vocab = await loadVoclist(
      VOC_SOURCES[currentLang].base + l.filename
    );
    startGame();
  });
}

/* =========================
   GAME FLOW
========================= */

function startGame(){
  keyboardEnabled = false;

  Game.start(vocab, Settings.data.numwords);
  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, Game.active);

  let t = Settings.data.timemem;
  timerEl.textContent = t;

  const memInterval = setInterval(()=>{
    t--;
    timerEl.textContent = t;

    if(t <= 0){
      clearInterval(memInterval);
      UI.showNumbers(board);
      nextQuestion();
    }
  },1000);
}

function nextQuestion(){
  const word = Game.pickTarget();
  wordBox.textContent = word;
  keyboardEnabled = true;
}

function handleAnswer(index){
  if(!keyboardEnabled) return;

  const btn = document.querySelector(
    `.card-btn[data-index="${index}"]`
  );
  if(!btn) return;

  keyboardEnabled = false;

  if(Game.check(index)){
    btn.classList.add("correct");
    UI.toast("🎉 ¡Correcto!");
    setTimeout(()=>{
      btn.classList.remove("correct");
      nextQuestion();
    },300);
  }else{
    btn.classList.add("wrong");
    UI.toast("❌ Fallaste");
    setTimeout(()=>{
      btn.classList.remove("wrong");
      startGame();
    },600);
  }
}

/* =========================
   CLICK INPUT
========================= */

board.onclick = e=>{
  const i = e.target.dataset.index;
  if(i !== undefined){
    handleAnswer(Number(i));
  }
};

/* =========================
   KEYBOARD INPUT (1–9)
========================= */

document.addEventListener("keydown", e=>{
  if(!keyboardEnabled) return;
  if(e.key >= "1" && e.key <= "9"){
    handleAnswer(Number(e.key) - 1);
  }
});

/* =========================
   START
========================= */

selectVocabulary();
