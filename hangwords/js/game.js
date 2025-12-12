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

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function saveStats(stats) {
    localStorage.setItem("hangmanStats", JSON.stringify(stats));
}

function loadStats() {
    const stored = localStorage.getItem("hangmanStats");
    return stored ? JSON.parse(stored) : { correct: 0, wrong: 0 };
    let stats = {
          score: 0,             // puntos totales
          correctLetters: 0     // letras acertadas en la palabra actual
    };
}

// Normaliza texto eliminando acentos
function normalizeChar(c) {
    return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* ===========================
      HANGMAN SVG (10 etapas)
=========================== */
function updateHangmanSVG(stage) {
    const svg = document.getElementById("hangmanSVG");
    if (!svg) return;
    svg.innerHTML = "";

    // Etapas
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

function updateStatsDisplay() {
    const scoreEl = document.getElementById("score");
    const correctEl = document.getElementById("correctLetters");
    const livesEl = document.getElementById("lives");
    
    if(scoreEl) scoreEl.textContent = stats.correct + stats.wrong;
    if(correctEl) correctEl.textContent = stats.correct;
    if(livesEl) livesEl.textContent = maxMistakes - mistakes;
}

// Alias para claridad
function updateLivesDisplay() {
    const livesEl = document.getElementById("lives");
    if(livesEl) livesEl.textContent = maxMistakes - mistakes;
}

/* ===========================
      GUESS LETTER (actualizado)
=========================== */
function guessLetter(letter) {
    if (!currentWord) return;
    if (lettersGuessed.has(letter)) return;

    lettersGuessed.add(letter);
    let correct = false;

    currentWord.split("").forEach((c, i) => {
        if (normalizeChar(c) === normalizeChar(letter)) {
            currentWordDisplay[i] = c;
            correct = true;
        }
    });

    updateDisplay();

    const keyBtn = Array.from(document.querySelectorAll(".key"))
        .find(k => normalizeChar(k.textContent) === normalizeChar(letter));

    if (correct) {
        if (keyBtn) { keyBtn.classList.add("correct"); keyBtn.disabled = true; }

        stats.correctLetters++;      // incrementa letras correctas
        stats.score++;               // incrementa score global
        updateScoreDisplay();        // actualizar marcadores

        toast(randomFrom(langStrings[window.settingsLocal.lang]?.successMessages || ["¡Bien!"]));

        if (!currentWordDisplay.includes("_")) setTimeout(nextWord, 800);

    } else {
        mistakes++;
        updateHangmanSVG(mistakes);
        if (keyBtn) { keyBtn.classList.add("wrong"); keyBtn.disabled = true; }

        toast(randomFrom(langStrings[window.settingsLocal.lang]?.failMessages || ["Fallaste"]));

        if (mistakes >= maxMistakes) showCorrectWord();
    }
}

/* ===========================
      JUEGO
=========================== */

async function startGame() {
    if (!window.currentVoc || Object.keys(window.currentVoc).length === 0) {
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

function nextWord() {
    // Reinicia errores y vidas para la nueva palabra
    mistakes = 0;
    stats.correctLetters = 0;        // reset letras acertadas para la nueva palabra
    updateLivesDisplay();
    updateHangmanSVG(0);             // resetea el muñeco

    if (questionsLeft <= 0) { endGame(); return; }

    const vocArray = Object.values(window.currentVoc); // array de objetos
    const longWords = vocArray.filter(v => v.pin && v.pin.replace(/\s/g, '').length >= 5);
    shuffleArray(longWords);

    if (longWords.length === 0) { toast("No words with 5+ letters"); return; }

    currentWord = longWords[0].pin;
    console.log("Word selected (raw):", currentWord);

    // Genera display con guiones _ solo para letras, espacios se conservan
    currentWordDisplay = Array.from(currentWord).map(c => c === " " ? " " : "_");

    lettersGuessed.clear();
    resetKeyboard();
    updateDisplay();
    updateScoreDisplay();           // actualizar marcadores
    questionsLeft--;
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = stats.score;
    document.getElementById("correctLetters").textContent = stats.correctLetters;
}

/* Elimina clases de color de teclas y desbloquea todas */
function resetKeyboard() {
    document.querySelectorAll(".key").forEach(k => {
        k.classList.remove("correct", "wrong");
        k.disabled = false;
    });
}

function showCorrectWord() {
    toast("❗ La palabra era: " + currentWord);
    document.querySelectorAll(".key").forEach(k => k.disabled = true);
    setTimeout(nextWord, 3000);
}

function updateDisplay() {
    const wordArea = document.getElementById("wordArea");
    if (!wordArea) return;

    // Mostrar guiones separados por espacios, sustituyendo por letras acertadas
    const displayText = currentWordDisplay.map(c => c === " " ? " " : c).join(" ");
    wordArea.textContent = displayText;
}

function endGame() { toast("🏁 ¡Juego terminado!"); }

/* ===========================
      TECLADO
=========================== */

function initKeyboard() {
    const keyboard = document.getElementById("keyboard");
    if (!keyboard) return;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    keyboard.innerHTML = "";
    letters.forEach(l => {
        const key = document.createElement("button");
        key.className = "key";
        key.textContent = l;
        key.addEventListener("click", () => guessLetter(l));
        keyboard.appendChild(key);
    });
}

/* ===========================
      VOCABULARIO
=========================== */

function loadCurrentVoc(vocObj) { window.currentVoc = vocObj || {}; }

/* ===========================
      INICIO DE APP
=========================== */

function initGameBindings() {
    const btnNew = document.getElementById("btnNew");
    if (btnNew) btnNew.addEventListener("click", startGame);
}

window.addEventListener("DOMContentLoaded", () => {

    initKeyboard();
    initGameBindings();

    // === CUSTOM WORDS MODAL LOGIC (sin duplicar btnAdd) ===
    const modal = document.getElementById("customWordsModal");
    const input = document.getElementById("customWordsInput");
    const btnOK = document.getElementById("modalOk");
    const btnCancel = document.getElementById("modalCancel");

    // Cerrar modal
    btnCancel?.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Confirmar lista de palabras
    btnOK?.addEventListener("click", () => {
        const raw = input.value.trim();

        if (!raw) {
            toast("No words entered");
            return;
        }

        // Separar por espacios, comas, punto y coma y puntos
        const list = raw
            .split(/[\s,.;]+/)
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 0);

        if (list.length === 0) {
            toast("Invalid list");
            return;
        }

        // Guardamos la nueva lista personalizada
        window.customWordList = list;
        window.useCustomWords = true;

        toast("Custom list loaded: " + list.length + " words");
        modal.classList.add("hidden");

        // Arrancar nueva palabra usando esta lista
        nextWord();
    });

});
