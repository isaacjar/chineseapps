/* game.js — flujo del juego y lógica */

let currentWord = null;
let previousWord = null;         // para no repetir la palabra anterior
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function saveStats(stats) { localStorage.setItem("hangmanStats", JSON.stringify(stats)); }

function loadStats() {
    const stored = localStorage.getItem("hangmanStats");
    if (stored) {
        const s = JSON.parse(stored);
        s.score = s.score || 0;
        s.correctLetters = s.correctLetters || 0;
        s.correct = s.correct || 0;
        s.wrong = s.wrong || 0;
        return s;
    }
    return { correct: 0, wrong: 0, score: 0, correctLetters: 0 };
}

// Normaliza texto eliminando acentos
function normalizeChar(c) { return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

/* ===========================
      HANGMAN SVG (10 etapas)
=========================== */
function updateHangmanSVG(stage) {
    const svg = document.getElementById("hangmanSVG");
    if (!svg) return;
    svg.innerHTML = "";

    if (stage >= 1) { const base = document.createElementNS("http://www.w3.org/2000/svg","line"); base.setAttribute("x1",10); base.setAttribute("y1",190); base.setAttribute("x2",90); base.setAttribute("y2",190); base.setAttribute("stroke","black"); base.setAttribute("stroke-width",4); svg.appendChild(base);}
    if (stage >= 2) { const pole = document.createElementNS("http://www.w3.org/2000/svg","line"); pole.setAttribute("x1",50); pole.setAttribute("y1",190); pole.setAttribute("x2",50); pole.setAttribute("y2",20); pole.setAttribute("stroke","black"); pole.setAttribute("stroke-width",4); svg.appendChild(pole);}
    if (stage >= 3) { const top = document.createElementNS("http://www.w3.org/2000/svg","line"); top.setAttribute("x1",50); top.setAttribute("y1",20); top.setAttribute("x2",120); top.setAttribute("y2",20); top.setAttribute("stroke","black"); top.setAttribute("stroke-width",4); svg.appendChild(top);}
    if (stage >= 4) { const rope = document.createElementNS("http://www.w3.org/2000/svg","line"); rope.setAttribute("x1",120); rope.setAttribute("y1",20); rope.setAttribute("x2",120); rope.setAttribute("y2",50); rope.setAttribute("stroke","black"); rope.setAttribute("stroke-width",3); svg.appendChild(rope);}
    if (stage >= 5) { const head = document.createElementNS("http://www.w3.org/2000/svg","circle"); head.setAttribute("cx",120); head.setAttribute("cy",70); head.setAttribute("r",20); head.setAttribute("stroke","black"); head.setAttribute("stroke-width",3); head.setAttribute("fill","none"); svg.appendChild(head);}
    if (stage >= 6) { const body = document.createElementNS("http://www.w3.org/2000/svg","line"); body.setAttribute("x1",120); body.setAttribute("y1",90); body.setAttribute("x2",120); body.setAttribute("y2",140); body.setAttribute("stroke","black"); body.setAttribute("stroke-width",3); svg.appendChild(body);}
    if (stage >= 7) { const armL = document.createElementNS("http://www.w3.org/2000/svg","line"); armL.setAttribute("x1",120); armL.setAttribute("y1",110); armL.setAttribute("x2",90); armL.setAttribute("y2",90); armL.setAttribute("stroke","black"); armL.setAttribute("stroke-width",3); svg.appendChild(armL);}
    if (stage >= 8) { const armR = document.createElementNS("http://www.w3.org/2000/svg","line"); armR.setAttribute("x1",120); armR.setAttribute("y1",110); armR.setAttribute("x2",150); armR.setAttribute("y2",90); armR.setAttribute("stroke","black"); armR.setAttribute("stroke-width",3); svg.appendChild(armR);}
    if (stage >= 9) { const legL = document.createElementNS("http://www.w3.org/2000/svg","line"); legL.setAttribute("x1",120); legL.setAttribute("y1",140); legL.setAttribute("x2",90); legL.setAttribute("y2",170); legL.setAttribute("stroke","black"); legL.setAttribute("stroke-width",3); svg.appendChild(legL);}
    if (stage >= 10) { const legR = document.createElementNS("http://www.w3.org/2000/svg","line"); legR.setAttribute("x1",120); legR.setAttribute("y1",140); legR.setAttribute("x2",150); legR.setAttribute("y2",170); legR.setAttribute("stroke","black"); legR.setAttribute("stroke-width",3); svg.appendChild(legR);}
}

/* ===========================
      ESTADÍSTICAS
=========================== */
function updateStatsDisplay() {
    const scoreEl = document.getElementById("score");
    const correctEl = document.getElementById("correctLetters");
    const livesEl = document.getElementById("lives");
    
    if(scoreEl) scoreEl.textContent = stats.score;
    if(correctEl) correctEl.textContent = stats.correctLetters;
    if(livesEl) livesEl.textContent = maxMistakes - mistakes;
}

/* ===========================
      GUESS LETTER
=========================== */
function guessLetter(letter) {
    if (!currentWord) return;
    if (lettersGuessed.has(letter)) return;

    lettersGuessed.add(letter);
    let correct = false;

    currentWord.split("").forEach((c,i) => {
        if (normalizeChar(c) === normalizeChar(letter)) {
            currentWordDisplay[i] = c;
            correct = true;
        }
    });

    updateDisplay();

    const keyBtn = Array.from(document.querySelectorAll(".key")).find(k=>normalizeChar(k.textContent)===normalizeChar(letter));

    if(correct){
        if(keyBtn){ keyBtn.classList.add("correct"); keyBtn.disabled=true; }
        stats.correctLetters++;

        toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.successMessages || ["¡Bien!"]));

        if(!currentWordDisplay.includes("_")){
            stats.score += stats.correctLetters;
            stats.correct++;
            saveStats();
            setTimeout(nextWord,800);
        }

    } else {
        mistakes++;
        updateHangmanSVG(mistakes);
        if(keyBtn){ keyBtn.classList.add("wrong"); keyBtn.disabled=true; }
        toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.failMessages || ["Fallaste"]));

        if(mistakes >= maxMistakes){
            stats.wrong++;
            saveStats();
            showCorrectWord();
        }
    }

    updateStatsDisplay();
}

/* ===========================
      JUEGO
=========================== */
async function startGame() {
    if(!window.currentVoc || Object.keys(window.currentVoc).length===0){
        toast("No vocabulary loaded!");
        return;
    }
    mistakes = 0;
    lettersGuessed.clear();
    maxMistakes = window.settingsLocal?.lives || 5;
    questionsLeft = window.settingsLocal?.questions || 10;
    resetKeyboard();
    updateHangmanSVG(0);
    nextWord();
}

function nextWord(){
    mistakes=0;
    stats.correctLetters=0;
    lettersGuessed.clear();
    updateLivesDisplay();
    updateHangmanSVG(0);

    if(questionsLeft<=0){ endGame(); return; }

    const vocArray = Object.values(window.currentVoc);
    const longWords = vocArray.filter(v=>v.pin && v.pin.replace(/\s/g,'').length>=5);
    shuffleArray(longWords);

    // Evitar repetir palabra anterior
    let next = longWords.find(w=>w.pin!==previousWord);
    if(!next) next = longWords[0];  // fallback
    currentWord = next.pin;
    previousWord = currentWord;

    console.log("Playing word:", currentWord); // log para pruebas

    currentWordDisplay = Array.from(currentWord).map(c=>c===" "?" ":"_");
    resetKeyboard();
    updateDisplay();
    updateScoreDisplay();
    questionsLeft--;
}

/* ===========================
      SCORE & DISPLAY
=========================== */
function updateScoreDisplay() {
    document.getElementById("score").textContent = stats.score;
    document.getElementById("correctLetters").textContent = stats.correctLetters;
}

function updateLivesDisplay() {
    const livesEl = document.getElementById("lives");
    if(livesEl) livesEl.textContent = maxMistakes - mistakes;
}

/* ===========================
      TECLADO
=========================== */
function initKeyboard(){
    const keyboard = document.getElementById("keyboard");
    if(!keyboard) return;
    keyboard.innerHTML="";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{
        const key = document.createElement("button");
        key.className="key";
        key.textContent=l;
        key.addEventListener("click",()=>guessLetter(l));
        keyboard.appendChild(key);
    });
}

function resetKeyboard(){
    document.querySelectorAll(".key").forEach(k=>{
        k.classList.remove("correct","wrong");
        k.disabled=false;
    });
}

/* ===========================
      MODAL PALABRAS BLOQUEANTE
=========================== */
const modal = document.getElementById("customWordsModal");
const overlay = document.createElement("div");
overlay.id="modalOverlay";
overlay.style.display="none";
overlay.style.position="fixed";
overlay.style.top="0";
overlay.style.left="0";
overlay.style.width="100%";
overlay.style.height="100%";
overlay.style.background="rgba(0,0,0,0.5)";
overlay.style.zIndex="999";
document.body.appendChild(overlay);

function openCustomWordsModal(){
    modal.classList.remove("hidden");
    overlay.style.display="block";
    document.body.classList.add("modal-open");
    document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=true);
}

function closeCustomWordsModal(){
    modal.classList.add("hidden");
    overlay.style.display="none";
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=false);
}

document.getElementById("btnAdd").addEventListener("click", openCustomWordsModal);
document.getElementById("modalCancel").addEventListener("click", closeCustomWordsModal);
document.getElementById("modalOK").addEventListener("click", ()=>{
    const raw = document.getElementById("customWordsInput").value.trim();
    if(!raw){ toast("No words entered"); return; }

    const list = raw.split(/[\s,.;]+/).map(w=>w.trim().toLowerCase()).filter(w=>w.length>0);
    if(list.length===0){ toast("Invalid list"); return; }

    // Guardamos la lista personalizada y activamos su uso
    window.customWordList = list;
    window.useCustomWords = true;

    closeCustomWordsModal();
    toast("Custom list loaded: "+list.length+" words");

    // Arrancar la primera palabra usando la lista personalizada
    nextWord();
});

/* ===========================
      OTROS
=========================== */
function showCorrectWord(){
    toast("❗ La palabra era: "+currentWord);
    document.querySelectorAll(".key").forEach(k=>k.disabled=true);
    setTimeout(nextWord,3000);
}

function endGame(){ toast("🏁 ¡Juego terminado!"); }

function loadCurrentVoc(vocObj){ window.currentVoc=vocObj||{}; }

function initGameBindings(){
    const btnNew = document.getElementById("btnNew");
    if(btnNew) btnNew.addEventListener("click",startGame);
}

/* ===========================
      INIT
=========================== */
window.addEventListener("DOMContentLoaded",()=>{
    initKeyboard();
    initGameBindings();
});
