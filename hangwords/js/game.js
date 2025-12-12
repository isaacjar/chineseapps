/* game.js — juego de Hangman depurado y compacto */

let currentWord = null, previousWord = null;
let currentWordDisplay = [], mistakes = 0, maxMistakes = 0, questionsLeft = 0;
let lettersGuessed = new Set(), stats = loadStats(), usedWords = [];

/* ===========================
      UTILIDADES
=========================== */
function randomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
function saveStats(){ localStorage.setItem("hangmanStats",JSON.stringify(stats)); }
function loadStats(){ 
    const stored=localStorage.getItem("hangmanStats"); 
    if(stored){ let s=JSON.parse(stored); s.score=s.score||0; s.correctLetters=s.correctLetters||0; s.correct=s.correct||0; s.wrong=s.wrong||0; return s; } 
    return {correct:0,wrong:0,score:0,correctLetters:0}; 
}
function normalizeChar(c){ return c.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); }
function safeAddEventListener(id, ev, fn){ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }

/* ===========================
      DISPLAY
=========================== */
function updateDisplay(){ const w=document.getElementById("wordArea"); if(w) w.textContent=currentWordDisplay.map(c=>c===" "?" ":c).join(" "); }
function updateScoreDisplay(){ const s=document.getElementById("score"); const c=document.getElementById("correctLetters"); if(s) s.textContent=stats.score; if(c) c.textContent=stats.correctLetters; }
function updateLivesDisplay(){ const l=document.getElementById("lives"); if(l) l.textContent=maxMistakes-mistakes; }
function updateStatsDisplay(){ updateScoreDisplay(); updateLivesDisplay(); }

/* ===========================
      HANGMAN SVG
=========================== */
function updateHangmanSVG(stage){
    const svg=document.getElementById("hangmanSVG"); if(!svg) return; svg.innerHTML="";
    if(stage>=1){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",10); l.setAttribute("y1",190); l.setAttribute("x2",90); l.setAttribute("y2",190); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=2){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",50); l.setAttribute("y1",190); l.setAttribute("x2",50); l.setAttribute("y2",20); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=3){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",50); l.setAttribute("y1",20); l.setAttribute("x2",120); l.setAttribute("y2",20); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",4); svg.appendChild(l);}
    if(stage>=4){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",20); l.setAttribute("x2",120); l.setAttribute("y2",50); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=5){ let c=document.createElementNS("http://www.w3.org/2000/svg","circle"); c.setAttribute("cx",120); c.setAttribute("cy",70); c.setAttribute("r",20); c.setAttribute("stroke","black"); c.setAttribute("stroke-width",3); c.setAttribute("fill","none"); svg.appendChild(c);}
    if(stage>=6){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",90); l.setAttribute("x2",120); l.setAttribute("y2",140); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=7){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",110); l.setAttribute("x2",90); l.setAttribute("y2",90); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=8){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",110); l.setAttribute("x2",150); l.setAttribute("y2",90); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=9){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",140); l.setAttribute("x2",90); l.setAttribute("y2",170); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
    if(stage>=10){ let l=document.createElementNS("http://www.w3.org/2000/svg","line"); l.setAttribute("x1",120); l.setAttribute("y1",140); l.setAttribute("x2",150); l.setAttribute("y2",170); l.setAttribute("stroke","black"); l.setAttribute("stroke-width",3); svg.appendChild(l);}
}

/* ===========================
      TECLADO
=========================== */
function initKeyboard(){ 
    const k=document.getElementById("keyboard"); if(!k) return; k.innerHTML="";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{ 
        const btn=document.createElement("button"); btn.className="key"; btn.textContent=l; 
        btn.addEventListener("click",()=>guessLetter(l)); k.appendChild(btn);
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
        mistakes++; updateHangmanSVG(mistakes);
        if(keyBtn){ keyBtn.classList.add("wrong"); keyBtn.disabled=true; }
        toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.failMessages||["Fallaste"]));
        if(mistakes>=maxMistakes){ stats.wrong++; saveStats(); showCorrectWord(); }
    }
    updateStatsDisplay();
}

/* ===========================
      JUEGO
=========================== */
async function startGame(){
    if(!window.currentVoc || Object.keys(window.currentVoc).length===0){ toast("No vocabulary loaded!"); return; }
    mistakes=0; lettersGuessed.clear(); usedWords=[];
    maxMistakes=window.settingsLocal?.lives||5; questionsLeft=window.settingsLocal?.questions||10;
    resetKeyboard(); updateHangmanSVG(0); nextWord();
}

function nextWord(){
    mistakes=0; stats.correctLetters=0; lettersGuessed.clear();
    updateHangmanSVG(0); updateStatsDisplay();

    if(questionsLeft<=0){ endGame(); return; }

    let vocArray = (window.useCustomWords && Array.isArray(window.customWordList))
        ? window.customWordList.map(w=>({pin:w}))
        : Object.values(window.currentVoc);

    const longWords = vocArray.filter(v=>v.pin && v.pin.replace(/\s/g,'').length>=5);
    const availableWords = longWords.filter(w=>!usedWords.includes(w.pin));
    if(availableWords.length===0) usedWords=[]; // reset usedWords si se acabaron
    shuffleArray(longWords);

    let next = availableWords[0] || longWords[0];
    currentWord = next.pin; previousWord=currentWord;
    usedWords.push(currentWord);

    currentWordDisplay = Array.from(currentWord).map(c=>"_" );
    resetKeyboard(); updateDisplay(); updateStatsDisplay();
    questionsLeft--;
}

/* ===========================
      MODALES Y OVERLAY
=========================== */
const modal=document.getElementById("customWordsModal"),
      wordListModal=document.getElementById("wordListModal"),
      wordListContainer=document.getElementById("wordListContainer"),
      overlay=document.createElement("div");

overlay.id="modalOverlay"; overlay.style.display="none"; overlay.style.position="fixed"; overlay.style.top="0"; overlay.style.left="0";
overlay.style.width="100%"; overlay.style.height="100%"; overlay.style.background="rgba(0,0,0,0.5)"; overlay.style.zIndex="999";
document.body.appendChild(overlay);

function openModal(modalEl){ modalEl.style.display="block"; overlay.style.display="block"; document.body.classList.add("modal-open"); }
function closeModal(modalEl){ modalEl.style.display="none"; if(!document.querySelector(".custom-modal:not(.hidden), #wordListModal[style*='block']")){ overlay.style.display="none"; document.body.classList.remove("modal-open"); } }

safeAddEventListener("btnAdd","click",()=>openModal(modal));
safeAddEventListener("modalCancel","click",()=>closeModal(modal));
safeAddEventListener("modalOK","click",()=>{
    const raw = document.getElementById("customWordsInput")?.value.trim();
    if(!raw){ toast("No words entered"); return; }

    const list = raw.split(/[\s,.;]+/).map(w=>w.trim().toLowerCase()).filter(w=>w.length>0);
    if(list.length === 0){ toast("Invalid list"); return; }

    window.customWordList = list;
    window.useCustomWords = true;

    closeModal(modal); 
    toast("Custom list loaded: "+list.length+" words");

    // Arrancar el juego directamente como si se seleccionara un listado de vocabulario
    startGame();
});

safeAddEventListener("btnListWords","click",()=>{
    if(!wordListContainer) return; wordListContainer.innerHTML="";
    let words = (window.useCustomWords && Array.isArray(window.customWordList))
    ? window.customWordList.filter(w=>w.replace(/\s/g,'').length>=5)
    : window.currentVoc ? Object.values(window.currentVoc).map(v=>v.pin).filter(w=>w.replace(/\s/g,'').length>=5) : [];
    if(words.length===0) wordListContainer.innerHTML="<li>No words loaded</li>";
    else words.forEach(w=>{ const li=document.createElement("li"); li.textContent=w; wordListContainer.appendChild(li); });
    openModal(wordListModal);
});
safeAddEventListener("wordListClose","click",()=>closeModal(wordListModal));

/* ===========================
      OTROS
=========================== */
function showCorrectWord(){ toast("❗ La palabra era: "+currentWord); document.querySelectorAll(".key").forEach(k=>k.disabled=true); setTimeout(nextWord,3000); }
function endGame(){ toast("🏁 ¡Juego terminado!"); }
function loadCurrentVoc(vocObj){ window.currentVoc=vocObj||{}; }
function initGameBindings(){ safeAddEventListener("btnNew","click",startGame); }

/* ===========================
      INIT
=========================== */
window.addEventListener("DOMContentLoaded",()=>{ initKeyboard(); initGameBindings(); });
