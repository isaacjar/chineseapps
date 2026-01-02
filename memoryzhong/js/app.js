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
  if(btnSettings){
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
const memProgress = document.querySelector(".mem-progress");

/* =========================
   STATE
========================= */
let vocab = [];
let vocabRaw = [];
let currentLang = Settings.data.lang || "zh";
let disableKeyboard = null;
let memPhase = false;
let running = false;
let orderRandom = Settings.data.showOrdered !== true;
let memInterval = null;
let roundInterval = null;

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
  const url=VOC_SOURCES[lang].index;
  if(lang==="zh"){
    const txt=await fetch(url).then(r=>r.text());
    return Function(txt+"; return voclists;")();
  }else{
    const res=await fetch(url);
    if(!res.ok) throw new Error(`No se pudo cargar ${url}`);
    return await res.json();
  }
}

async function loadVoclist(lang,filename){
  const base=VOC_SOURCES[lang].base;
  let url;
  if(lang==="zh"){
    url=`${base}${filename}.json`;
    const list=await fetch(url).then(r=>r.json());
    vocabRaw=list;
    return list.map(w=>w.ch);
  }else{
    url=`${base}${filename}`;
    const list=await fetch(url).then(r=>r.json());
    vocabRaw=list;
    return list.map(w=>w[lang]);
  }
}

/* =========================
   SELECT VOCABULARY
========================= */
async function selectVocabulary(){
  const lists=await loadIndex(currentLang);
  if(params.get("voclist")){
    vocab=await loadVoclist(currentLang,params.get("voclist"));
    resetGame();
    return;
  }
  showVoclistPopup(lists,async l=>{
    vocab=await loadVoclist(currentLang,l.filename);
    resetGame();
  });
}

/* =========================
   HELPERS
========================= */
function formatWord(word){
  if(currentLang!=="zh") return word;
  const obj=vocabRaw.find(w=>w.ch===word);
  if(!obj) return word;
  if(Settings.data.showPinyin) return `${obj.ch}\n${obj.pin}`;
  return obj.ch;
}

function clearTimers(){
  if(memInterval){ clearInterval(memInterval); memInterval=null; }
  if(roundInterval){ clearInterval(roundInterval); roundInterval=null; }
}

/* =========================
   GAME FLOW
========================= */
function resetGame(){
  running=false;
  memPhase=false;
  UI.renderBoard(board, Settings.data.numwords);
  wordBox.textContent="";
  timerEl.textContent="";
  if(memBar) memBar.style.width="0%";
  if(btnStart) btnStart.textContent="START";
  if(disableKeyboard){ disableKeyboard(); disableKeyboard=null; }
}

function startMemPhase(resumeTime){
  memPhase = true;
  btnStart.textContent = "PAUSE";

  Game.start(vocab, Settings.data.numwords);
  let words = [...Game.active];
  if(orderRandom) words.sort(()=>Math.random()-0.5);
  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, words.map(formatWord));

  // si resumeTime está definido, continuamos desde ahí
  let t = resumeTime ?? Settings.data.timemem;
  const total = Settings.data.timemem;
  if(memProgress) memProgress.classList.add("active");

  memInterval = setInterval(() => {
    if(!running) return; // respeta pausa
    t--;
    if(timerEl) timerEl.textContent = `Mem: ${t}s`;
    if(memBar) memBar.style.width = `${((total - t)/total)*100}%`;
    if(t <= 0){
      clearInterval(memInterval);
      memInterval = null;
      memPhase = false;
      UI.showNumbers(board);
      if(memBar) memBar.style.width = "0%";
      startRoundPhase();
    }
  }, 1000);
}

function startRoundPhase(resumeTime){
  let totalTime = resumeTime ?? Settings.data.time;

  roundInterval = setInterval(() => {
    if(!running) return; // respeta pausa
    const mins = Math.floor(totalTime/60);
    const secs = totalTime % 60;
    if(timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2,'0')}`;
    totalTime--;
    if(totalTime < 0){
      clearInterval(roundInterval);
      roundInterval = null;
    }
  }, 1000);

  nextQuestion();
}

function nextQuestion(){
  const word = Game.pickTarget();
  if(!wordBox) return;

  // Fade-out
  wordBox.classList.add("fade-out");

  setTimeout(()=>{
    // Cambiar palabra
    wordBox.textContent = formatWord(word);

    // Fade-in
    wordBox.classList.remove("fade-out");
    wordBox.classList.add("fade-in");

    setTimeout(()=>wordBox.classList.remove("fade-in"),300);
  },300);

  // Habilitar input
  if(disableKeyboard) disableKeyboard();
  disableKeyboard = enableKeyboardInput(Settings.data.numwords, handleAnswer);
}

function handleAnswer(index){
  if(memPhase || !running) return;

  const btn = document.querySelector(`.card-btn[data-index="${index}"]`);
  if(!btn) return;

  const targetWord = Game.active[Game.targetIndex];

  if(Game.check(index)){
    // ✅ Acertaste
    btn.classList.add("correct");
    if(wordBox) wordBox.textContent = formatWord(targetWord); // mostrar palabra correcta
    UI.toast("🎉 ¡Correcto!");
    UI.celebrate([...board.children]);
    new Audio("./sounds/correct.mp3").play();

    // Mantener verde un instante antes de pasar a la siguiente palabra
    setTimeout(()=>{
      btn.classList.remove("correct");
      nextQuestion();
    },800);

  } else {
    // ❌ Fallaste
    UI.toast("❌ Fallaste");
    new Audio("./sounds/wrong.mp3").play();

    // Girar todos los botones mostrando los números
    [...board.children].forEach((b,i)=>{
      b.textContent = i+1;
      b.classList.add("wrong");
    });

    setTimeout(()=>{
      [...board.children].forEach(b=>b.classList.remove("wrong"));
      resetGame(); // reinicia juego
    },1000);
  }
}

/* =========================
   CLICK HANDLER
========================= */
board.onclick=e=>{
  if(!e.target.dataset.index) return;
  handleAnswer(Number(e.target.dataset.index));
};

/* =========================
   START/PAUSE BUTTON
========================= */
if(btnStart){
  btnStart.onclick = () => {
    if(!running){
      // REANUDAR
      running = true;
      btnStart.textContent = "PAUSE";

      if(memPhase && memInterval){
        // ya está corriendo, solo sigue
      } else if(memPhase && !memInterval){
        // estaba en pausa, reanudar desde tiempo restante
        startMemPhase(parseInt(timerEl.textContent.replace(/\D/g,'')));
      } else {
        // iniciar desde cero
        startMemPhase();
      }

    } else {
      // PAUSAR
      running = false;
      btnStart.textContent = "START";
      // no hacemos clearTimers() para permitir reanudar
    }
  };
}

/* =========================
   INITIAL LOAD
========================= */
selectVocabulary();
