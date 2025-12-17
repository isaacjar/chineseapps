/* game.js — modo palabra a palabra + modo aprendizaje */

let currentWord=null, currentWordObj=null, currentWordDisplay=[],
    mistakes=0, maxMistakes=7,
    lettersGuessed=new Set(), usedWords=[],
    roundActive=false, roundFinished=false,
    stats=loadStats();

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);
const randomFrom = a => a[Math.floor(Math.random()*a.length)];
const normalize = c => c.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

function saveStats(){ localStorage.setItem("hangmanStats", JSON.stringify(stats)); }
function loadStats(){ 
  const s = JSON.parse(localStorage.getItem("hangmanStats")||"{}"); 
  return {score: s.score||0, correct: s.correct||0, wrong: s.wrong||0};
}

/* ================= DISPLAY ================= */
function updateDisplay(){
  $("wordArea") && ($("wordArea").innerHTML = currentWordDisplay.join(" "));
  $("score") && ($("score").textContent = stats.score);
  $("lives") && ($("lives").textContent = maxMistakes - mistakes);
}

const resetWordStyles = () => {
  const wordArea = $("wordArea");
  wordArea?.classList.remove("word-success","word-fail");
  $("learningBox")?.classList.add("hidden"); // ocultar aprendizaje al iniciar
};

/* ================= HANGMAN SVG ================= */
function updateHangmanSVG(stage){
  const svg = $("hangmanSVG"); if(!svg) return;
  svg.innerHTML = "";

  const addLine = (x1,y1,x2,y2,w)=>{
    const l = document.createElementNS("http://www.w3.org/2000/svg","line");
    l.setAttribute("x1",x1); l.setAttribute("y1",y1);
    l.setAttribute("x2",x2); l.setAttribute("y2",y2);
    l.setAttribute("stroke","black"); l.setAttribute("stroke-width",w);
    svg.appendChild(l);
  };
  const addCircle = (cx,cy,r,w)=>{
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",cx); c.setAttribute("cy",cy); c.setAttribute("r",r);
    c.setAttribute("stroke","black"); c.setAttribute("stroke-width",w); c.setAttribute("fill","none");
    svg.appendChild(c);
  };

  if(stage>=1) addLine(10,190,90,190,4);   // base
  if(stage>=2) addLine(50,190,50,20,4);    // poste vertical
  if(stage>=3) addLine(50,20,120,20,4);    // travesaño
  if(stage>=4) addLine(120,20,120,50,3);   // cuerda
  if(stage>=5) addCircle(120,70,20,3);     // cabeza
  if(stage>=6) addLine(120,90,120,140,3);  // cuerpo
  if(stage>=7) addLine(120,110,90,90,3);   // brazo izquierdo
  if(stage>=8) addLine(120,110,150,90,3);  // brazo derecho
  if(stage>=9) addLine(120,140,90,170,3);  // pierna izquierda
  if(stage>=10) addLine(120,140,150,170,3); // pierna derecha
}

/* ================= TECLADO ================= */
function initKeyboard(){
  const k=$("keyboard"); if(!k) return;
  k.innerHTML="";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{
    const b=document.createElement("button");
    b.className="key"; b.textContent=l;
    b.onclick=()=>guessLetter(l);
    k.appendChild(b);
  });
}

const resetKeyboard = () => document.querySelectorAll(".key").forEach(b=>{
  b.disabled=false; b.classList.remove("correct","wrong");
});

/* ================= JUEGO ================= */
function startGame(customList){
  if(customList?.length){
    window.customWordList=customList; window.useCustomWords=true;
  }
  maxMistakes = window.settingsLocal?.lives || 7;
  usedWords = []; roundActive = false; roundFinished = false;
  updateHangmanSVG(0); updateDisplay();
}

function startNewRound(){
  if(roundActive){
    const proceed = confirm("¿Desea interrumpir la partida actual?");
    if(!proceed) return;          // si cancela, no hacemos nada
    finishRound(false);            // si confirma, terminamos la ronda como fallida
  }

  mistakes = 0; 
  lettersGuessed.clear();
  roundActive = true; 
  roundFinished = false;
  resetKeyboard(); 
  resetWordStyles();
  updateHangmanSVG(0);
  nextWord();
}

function nextWord(){
  const voc = (window.useCustomWords && Array.isArray(window.customWordList))
    ? window.customWordList.map(w=>({pin:w}))
    : Object.values(window.currentVoc||{});

  const words = voc.filter(v=>v.pin && v.pin.replace(/\s/g,'').length>=5);
  let avail = words.filter(w=>!usedWords.includes(w.pin));
  if(!avail.length){ usedWords=[]; avail=words; }

  currentWordObj = randomFrom(avail);
  currentWord = currentWordObj.pin;
  usedWords.push(currentWord);

  console.log("➡️ ", currentWord);
    
  currentWordDisplay = [...currentWord].map(c=>c===" "?" ":"_");
  updateDisplay();
}

/* ================= LETRAS ================= */
function guessLetter(letter){
  if(!roundActive||lettersGuessed.has(letter)) return;
  lettersGuessed.add(letter);

  let hit=false;
  [...currentWord].forEach((c,i)=>{
    if(normalize(c)===normalize(letter)){
      currentWordDisplay[i]=c; hit=true;
    }
  });

  const btn = [...document.querySelectorAll(".key")]
    .find(b=>normalize(b.textContent)===normalize(letter));
  btn && (btn.disabled=true, btn.classList.add(hit?"correct":"wrong"));

  hit ? onHit() : onFail();
}

function onHit(){
  updateDisplay();
  if(!currentWordDisplay.includes("_")) finishRound(true);
}

function onFail(){
  mistakes++; updateHangmanSVG(mistakes); updateDisplay();
  if(mistakes>=maxMistakes) finishRound(false);
}

/* ================= FIN DE RONDA ================= */
function finishRound(win){
  roundActive=false; roundFinished=true;
  document.querySelectorAll(".key").forEach(b=>b.disabled=true);

  const wordArea = $("wordArea");
  if(win){
    stats.score += currentWord.replace(/\s/g,"").length;
    stats.correct++;
    wordArea?.classList.add("word-success");
    setTimeout(()=>wordArea?.classList.remove("word-success"), 400);
  } else {
    stats.wrong++; revealWrongLetters();
    wordArea?.classList.add("word-fail");
  }
  saveStats(); showLearningInfo();
}

function revealWrongLetters(){
  const display = [...currentWord].map((c, i) => {
    if(c === " ") return " "; // espacio
    if(currentWordDisplay[i] !== "_") return c; // letra ya acertada
    return `<span style="color:red">${c}</span>`; // letra nueva en rojo
  });
  
  $("wordArea").innerHTML = display.join(""); // <-- no añadimos espacios extra
}

/* ================= MODO APRENDIZAJE ================= */
function showLearningInfo(){
  const box = $("learningBox"); if(!box||!currentWordObj) return;
  const {ch,pin,en,es} = currentWordObj;
  box.innerHTML = `${ch?`<div><b>${ch} [ ${pin} ]</b>  ${en} - ${es} </div>`:""}`;
  box.classList.remove("hidden");
}

/* ================= BINDINGS ================= */
const safe = (id, fn) => $(id)?.addEventListener("click", fn);
safe("btnNew", startNewRound);

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", ()=>{
  initKeyboard(); 
  startGame();

  // iniciar una palabra nueva si ya hay vocab cargado
  if(window.currentVoc?.length || (window.useCustomWords && window.customWordList?.length)){
    startNewRound();
  }
});
