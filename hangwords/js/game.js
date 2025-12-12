/* game.js — flujo del juego y lógica */

let currentWord = null;
let previousWord = null;
let currentWordDisplay = [];
let mistakes = 0;
let maxMistakes = 0;
let questionsLeft = 0;
let lettersGuessed = new Set();
let stats = loadStats();

/* ===========================
      UTILIDADES
=========================== */
function randomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffleArray(array){for(let i=array.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}}
function saveStats(){ localStorage.setItem("hangmanStats",JSON.stringify(stats)); }
function loadStats(){
    const stored = localStorage.getItem("hangmanStats");
    if(stored){ const s = JSON.parse(stored); s.score=s.score||0;s.correctLetters=s.correctLetters||0;s.correct=s.correct||0;s.wrong=s.wrong||0; return s;}
    return {correct:0,wrong:0,score:0,correctLetters:0};
}
function normalizeChar(c){ return c.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); }

/* ===========================
      DISPLAY
=========================== */
function updateDisplay(){
    const wordArea = document.getElementById("wordArea");
    if(wordArea) wordArea.textContent = currentWordDisplay.map(c=>c===" "?" ":c).join(" ");
}
function updateScoreDisplay(){
    document.getElementById("score").textContent = stats.score;
    document.getElementById("correctLetters").textContent = stats.correctLetters;
}
function updateLivesDisplay(){
    const livesEl = document.getElementById("lives");
    if(livesEl) livesEl.textContent = maxMistakes - mistakes;
}

/* ===========================
      HANGMAN SVG
=========================== */
function updateHangmanSVG(stage){
    const svg=document.getElementById("hangmanSVG"); if(!svg) return; svg.innerHTML="";
    if(stage>=1){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",10); l.setAttribute("y1",190); l.setAttribute("x2",90); l.setAttribute("y2",190); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=2){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",50); l.setAttribute("y1",190); l.setAttribute("x2",50); l.setAttribute("y2",20); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=3){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",50); l.setAttribute("y1",20); l.setAttribute("x2",120); l.setAttribute("y2",20); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=4){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",20); l.setAttribute("x2",120); l.setAttribute("y2",50); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=5){ const c=document.createElementNS("http://www.w3.org/2000/svg","circle"); c.setAttribute("cx",120); c.setAttribute("cy",70); c.setAttribute("r",20); c.setAttribute("stroke","black"); c.setAttribute("stroke-width",3); c.setAttribute("fill","none"); svg.appendChild(c);}
    if(stage>=6){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",90); l.setAttribute("x2",120); l.setAttribute("y2",140); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=7){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",110); l.setAttribute("x2",90); l.setAttribute("y2",90); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=8){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",110); l.setAttribute("x2",150); l.setAttribute("y2",90); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=9){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",140); l.setAttribute("x2",90); l.setAttribute("y2",170); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=10){ const l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",140); l.setAttribute("x2",150); l.setAttribute("y2",170); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
}

/* ===========================
      TECLADO
=========================== */
function initKeyboard(){
    const keyboard = document.getElementById("keyboard"); if(!keyboard) return;
    keyboard.innerHTML="";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{
        const key=document.createElement("button"); key.className="key"; key.textContent=l;
        key.addEventListener("click",()=>guessLetter(l));
        keyboard.appendChild(key);
    });
}
function resetKeyboard(){ document.querySelectorAll(".key").forEach(k=>{ k.classList.remove("correct","wrong"); k.disabled=false; }); }

/* ===========================
      GUESS LETTER
=========================== */
function guessLetter(letter){
    if(!currentWord || lettersGuessed.has(letter)) return;
    lettersGuessed.add(letter);
    let correct=false;
    currentWord.split("").forEach((c,i)=>{ if(normalizeChar(c)===normalizeChar(letter)){ currentWordDisplay[i]=c; correct=true; }});
    updateDisplay();
    const keyBtn=Array.from(document.querySelectorAll(".key")).find(k=>normalizeChar(k.textContent)===normalizeChar(letter));
    if(correct){
        if(keyBtn){ keyBtn.classList.add("correct"); keyBtn.disabled=true; }
        stats.correctLetters++;
        toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.successMessages||["¡Bien!"]));
        if(!currentWordDisplay.includes("_")){ stats.score+=stats.correctLetters; stats.correct++; saveStats(); setTimeout(nextWord,800); }
    } else {
        mistakes++;
        updateHangmanSVG(mistakes);
        if(keyBtn){ keyBtn.classList.add("wrong"); keyBtn.disabled=true; }
        toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.failMessages||["Fallaste"]));
        if(mistakes>=maxMistakes){ stats.wrong++; saveStats(); showCorrectWord(); }
    }
    updateScoreDisplay();
    updateLivesDisplay();
}

/* ===========================
      JUEGO
=========================== */
async function startGame(){
    if(!window.currentVoc || Object.keys(window.currentVoc).length===0){ toast("No vocabulary loaded!"); return; }
    mistakes=0; lettersGuessed.clear();
    maxMistakes=window.settingsLocal?.lives||5;
    questionsLeft=window.settingsLocal?.questions||10;
    resetKeyboard(); updateHangmanSVG(0); nextWord();
}
function nextWord(){
    mistakes=0; stats.correctLetters=0; lettersGuessed.clear();
    updateLivesDisplay(); updateHangmanSVG(0);
    if(questionsLeft<=0){ endGame(); return; }

    let vocArray = (window.useCustomWords && Array.isArray(window.customWordList))
        ? window.customWordList.map(w=>({pin:w}))
        : Object.values(window.currentVoc);

    const longWords = vocArray.filter(v=>v.pin && v.pin.replace(/\s/g,'').length>=5);
    shuffleArray(longWords);

    let next = longWords.find(w=>w.pin!==previousWord);
    if(!next) next=longWords[0];
    currentWord = next.pin; previousWord=currentWord;

    console.log("Playing word:", currentWord);

    currentWordDisplay = Array.from(currentWord).map(c=>c===" "?" ":"_");
    resetKeyboard(); updateDisplay(); updateScoreDisplay();
    questionsLeft--;
}

/* ===========================
      MODAL BLOQUEANTE
=========================== */
const modal = document.getElementById("customWordsModal");
const overlay = document.createElement("div");
overlay.id="modalOverlay"; overlay.style.display="none";
overlay.style.position="fixed"; overlay.style.top="0"; overlay.style.left="0";
overlay.style.width="100%"; overlay.style.height="100%";
overlay.style.background="rgba(0,0,0,0.5)"; overlay.style.zIndex="999";
document.body.appendChild(overlay);

function openCustomWordsModal(){
    modal.classList.remove("hidden"); overlay.style.display="block";
    document.body.classList.add("modal-open");
    document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=true);
    modal.focus();
}
function closeCustomWordsModal(){
    modal.classList.add("hidden"); overlay.style.display="none";
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=false);
}

document.getElementById("btnAdd").addEventListener("click",openCustomWordsModal);
document.getElementById("modalCancel").addEventListener("click",closeCustomWordsModal);
document.getElementById("modalOK").addEventListener("click",()=>{
    const raw=document.getElementById("customWordsInput").value.trim();
    if(!raw){ toast("No words entered"); return; }
    const list=raw.split(/[\s,.;]+/).map(w=>w.trim().toLowerCase()).filter(w=>w.length>0);
    if(list.length===0){ toast("Invalid list"); return; }
    window.customWordList=list; window.useCustomWords=true;
    closeCustomWordsModal(); toast("Custom list loaded: "+list.length+" words");
    nextWord();
});

/* ===========================
      OTROS
=========================== */
function showCorrectWord(){ toast("❗ La palabra era: "+currentWord); document.querySelectorAll(".key").forEach(k=>k.disabled=true); setTimeout(nextWord,3000); }
function endGame(){ toast("🏁 ¡Juego terminado!"); }
function loadCurrentVoc(vocObj){ window.currentVoc=vocObj||{}; }
function initGameBindings(){ const btnNew=document.getElementById("btnNew"); if(btnNew) btnNew.addEventListener("click",startGame); }

/* ===========================
      INIT
=========================== */
window.addEventListener("DOMContentLoaded",()=>{
    initKeyboard(); initGameBindings();
});
