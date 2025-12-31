import { Settings } from "./settings.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";
import { showVoclistPopup } from "./ui.js";
import { showSettingsPopup } from "./ui.js";
import { enableKeyboardInput } from "./ui.js";

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

async function loadVoclist(lang, filename){
  const data = await fetch(`${VOC_SOURCES[lang].base}${filename}.js`)
    .then(r=>r.text());

  const list = Function(data + "; return voclist;")();
  const field = lang === "zh" ? "zh" : lang;

  return list.map(w => w[field]).filter(Boolean);
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
  // 🔒 desactivar teclado previo
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
  const btn = document.querySelector(
    `.card-btn[data-index="${index}"]`
  );
  if(!btn) return;

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
   CLICK HANDLER (UNA SOLA VEZ)
========================= */

board.onclick = e=>{
  if(!e.target.dataset.index) return;
  handleAnswer(Number(e.target.dataset.index));
};

/* =========================
   START
========================= */

selectVocabulary();
