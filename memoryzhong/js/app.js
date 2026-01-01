// app.js
import { Settings } from "./settings.js";
import { Game } from "./game.js";
import { UI, showVoclistPopup, showSettingsPopup, enableKeyboardInput } from "./ui.js";
import { loadVoclist } from "./vocloader.js";

/* =========================
   SETTINGS
========================= */

const params = new URLSearchParams(location.search);
Settings.init(params);

document.getElementById("btnSettings").onclick = ()=>{
  showSettingsPopup(()=>{
    location.reload();
  });
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

/* =========================
   VOCABULARY SOURCES
========================= */

const VOC_SOURCES = {
  zh: {
    index: "https://isaacjar.github.io/chineseapps/voclists/index.js",
    base:  "https://isaacjar.github.io/chineseapps/voclists/"
  },
  es: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base:  "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  },
  en: {
    index: "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js",
    base:  "https://isaacjar.github.io/spanishapps/spanishvoc/voclists/"
  }
};

/* =========================
   LOAD VOCABULARY
========================= */

async function loadIndex(lang){
  const txt = await fetch(VOC_SOURCES[lang].index).then(r=>r.text());
  return Function(txt + "; return voclists;")();
}

async function selectVocabulary(){
  const lists = await loadIndex(currentLang);

  // voclist por URL → carga directa
  if(params.get("voclist")){
    const filename = params.get("voclist");
    const ext = currentLang === "zh" ? ".json" : "";
    vocab = await loadVoclist(`${VOC_SOURCES[currentLang].base}${filename}${ext}`);
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
  // limpiar teclado previo
  if(disableKeyboard){
    disableKeyboard();
    disableKeyboard = null;
  }

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

  if(disableKeyboard) disableKeyboard();

  disableKeyboard = enableKeyboardInput(
    Settings.data.numwords,
    handleAnswer
  );
}

function handleAnswer(index){
  const btn = board.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  if(Game.check(index)){
    btn.classList.add("correct");
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);

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
   CLICK HANDLER (BOTONES)
========================= */

board.onclick = e=>{
  const idx = e.target.dataset.index;
  if(idx !== undefined){
    handleAnswer(Number(idx));
  }
};

/* =========================
   START
========================= */

selectVocabulary();
