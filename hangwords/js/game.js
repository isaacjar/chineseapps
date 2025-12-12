/* game.js — flujo del juego y lógica */

let currentWord = null;
let currentWordDisplay = [];
let mistakes = 0;
let maxMistakes = 0;
let questionsLeft = 0;
let lettersGuessed = new Set();
let stats = loadStats();

/* ===========================
      UTILIDADES
=========================== */

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArray(array){ for(let i=array.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]]; } }
function saveStats(stats){ localStorage.setItem("hangmanStats",JSON.stringify(stats)); }
function loadStats(){ const stored=localStorage.getItem("hangmanStats"); return stored?JSON.parse(stored):{correct:0,wrong:0}; }
function removeTones(str){ return str.normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

/* ===========================
      HANGMAN SVG
=========================== */

function updateHangmanSVG(stage){
  const svg=document.getElementById("hangmanSVG");
  if(!svg) return;
  svg.innerHTML="";
  if(stage>=1){const base=document.createElementNS("http://www.w3.org/2000/svg","line");base.setAttribute("x1",10);base.setAttribute("y1",190);base.setAttribute("x2",90);base.setAttribute("y2",190);base.setAttribute("stroke","black");base.setAttribute("stroke-width",4);svg.appendChild(base);}
  if(stage>=2){const pole=document.createElementNS("http://www.w3.org/2000/svg","line");pole.setAttribute("x1",50);pole.setAttribute("y1",190);pole.setAttribute("x2",50);pole.setAttribute("y2",20);pole.setAttribute("stroke","black");pole.setAttribute("stroke-width",4);svg.appendChild(pole);}
  if(stage>=3){const top=document.createElementNS("http://www.w3.org/2000/svg","line");top.setAttribute("x1",50);top.setAttribute("y1",20);top.setAttribute("x2",120);top.setAttribute("y2",20);top.setAttribute("stroke","black");top.setAttribute("stroke-width",4);svg.appendChild(top);}
  if(stage>=4){const rope=document.createElementNS("http://www.w3.org/2000/svg","line");rope.setAttribute("x1",120);rope.setAttribute("y1",20);rope.setAttribute("x2",120);rope.setAttribute("y2",50);rope.setAttribute("stroke","black");rope.setAttribute("stroke-width",3);svg.appendChild(rope);}
  if(stage>=5){const head=document.createElementNS("http://www.w3.org/2000/svg","circle");head.setAttribute("cx",120);head.setAttribute("cy",70);head.setAttribute("r",20);head.setAttribute("stroke","black");head.setAttribute("stroke-width",3);head.setAttribute("fill","none");svg.appendChild(head);}
  if(stage>=6){const body=document.createElementNS("http://www.w3.org/2000/svg","line");body.setAttribute("x1",120);body.setAttribute("y1",90);body.setAttribute("x2",120);body.setAttribute("y2",140);body.setAttribute("stroke","black");body.setAttribute("stroke-width",3);svg.appendChild(body);}
  if(stage>=7){const armL=document.createElementNS("http://www.w3.org/2000/svg","line");armL.setAttribute("x1",120);armL.setAttribute("y1",110);armL.setAttribute("x2",90);armL.setAttribute("y2",90);armL.setAttribute("stroke","black");armL.setAttribute("stroke-width",3);svg.appendChild(armL);}
  if(stage>=8){const armR=document.createElementNS("http://www.w3.org/2000/svg","line");armR.setAttribute("x1",120);armR.setAttribute("y1",110);armR.setAttribute("x2",150);armR.setAttribute("y2",90);armR.setAttribute("stroke","black");armR.setAttribute("stroke-width",3);svg.appendChild(armR);}
  if(stage>=9){const legL=document.createElementNS("http://www.w3.org/2000/svg","line");legL.setAttribute("x1",120);legL.setAttribute("y1",140);legL.setAttribute("x2",90);legL.setAttribute("y2",170);legL.setAttribute("stroke","black");legL.setAttribute("stroke-width",3);svg.appendChild(legL);}
  if(stage>=10){const legR=document.createElementNS("http://www.w3.org/2000/svg","line");legR.setAttribute("x1",120);legR.setAttribute("y1",140);legR.setAttribute("x2",150);legR.setAttribute("y2",170);legR.setAttribute("stroke","black");legR.setAttribute("stroke-width",3);svg.appendChild(legR);}
}

/* ===========================
      JUEGO
=========================== */

async function startGame(){
  if(!window.currentVoc || Object.keys(window.currentVoc).length===0){toast("No vocabulary loaded!");return;}
  mistakes=0;lettersGuessed.clear();maxMistakes=window.settingsLocal?.lives||5;questionsLeft=window.settingsLocal?.questions||10;
  updateHangmanSVG(0);
  nextWord();
}

function nextWord(){
  if(questionsLeft<=0){endGame();return;}
  const keys=Object.keys(window.currentVoc).filter(k=>removeTones(k).length>=5);
  if(keys.length===0){toast("No words with at least 5 letters!");return;}
  shuffleArray(keys);
  currentWord=keys[0];
  currentWordDisplay=Array.from(currentWord).map(c=>c===" "?" ":"_");
  console.log("🎯 Word selected:",currentWord);
  updateDisplay();questionsLeft--;
}

function guessLetter(letter){
  if(lettersGuessed.has(letter)) return;
  lettersGuessed.add(letter);
  let correct=false;
  const normalized=removeTones(currentWord.toLowerCase());
  currentWord.split("").forEach((c,i)=>{if(normalized[i]===letter.toLowerCase()){currentWordDisplay[i]=c;correct=true;}});
  updateDisplay();
  const keyBtn=Array.from(document.querySelectorAll(".key")).find(k=>k.textContent.toLowerCase()===letter.toLowerCase());
  if(correct){toast(randomFrom(langStrings[window.settingsLocal.lang]?.successMessages||["¡Bien!"]));stats.correct++;saveStats(stats);if(keyBtn) keyBtn.classList.add("correct");if(!currentWordDisplay.includes("_")) setTimeout(nextWord,800);}
  else{mistakes++;updateHangmanSVG(mistakes);toast(randomFrom(langStrings[window.settingsLocal.lang]?.failMessages||["Fallaste"]));stats.wrong++;saveStats(stats);if(keyBtn) keyBtn.classList.add("wrong");if(mistakes>=maxMistakes) showCorrectWord();}
}

function showCorrectWord(){toast("❗ La palabra era: "+currentWord);setTimeout(nextWord,2000);}
function updateDisplay(){const wordArea=document.getElementById("wordArea");if(wordArea) wordArea.textContent=currentWordDisplay.join(" ");let lettersUsed=document.getElementById("lettersUsed");if(!lettersUsed){lettersUsed=document.createElement("div");lettersUsed.id="lettersUsed";document.getElementById("wordArea")?.appendChild(lettersUsed);}lettersUsed.textContent=[...lettersGuessed].join(" ");}

function endGame(){toast("🏁 ¡Juego terminado!");}

/* ===========================
      TECLADO
=========================== */

function initKeyboard(){
  const keyboard=document.getElementById("keyboard");
  if(!keyboard) return;
  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");keyboard.innerHTML="";
  letters.forEach(l=>{const key=document.createElement("button");key.className="key";key.textContent=l;key.addEventListener("click",()=>guessLetter(l));keyboard.appendChild(key);});
}

/* ===========================
      VOCABULARIO
=========================== */

function loadCurrentVoc(vocObj){window.currentVoc=vocObj||{}}

/* ===========================
      INICIO DE APP
=========================== */

function initGameBindings(){document.getElementById("btnNew")?.addEventListener("click",startGame);}
window.addEventListener("DOMContentLoaded",()=>{initKeyboard();initGameBindings();});
