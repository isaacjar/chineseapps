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
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function saveStats(stats) {
  localStorage.setItem("hangmanStats", JSON.stringify(stats));
}

function loadStats() {
  const stored = localStorage.getItem("hangmanStats");
  return stored ? JSON.parse(stored) : { correct: 0, wrong: 0 };
}

/* ===========================
      HANGMAN SVG
=========================== */

function updateHangmanSVG(parts) {
  const svg = document.getElementById("hangmanSVG");
  if (!svg) return;

  svg.innerHTML = "";
  for (let i = 1; i <= parts; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 20*i);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", 20*i);
    line.setAttribute("y2", 50);
    line.setAttribute("stroke", "black");
    svg.appendChild(line);
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

  updateHangmanSVG(0);
  nextWord();
}

function nextWord() {
  if (questionsLeft <= 0) {
    endGame();
    return;
  }

  const keys = Object.keys(window.currentVoc);
  shuffleArray(keys);

  currentWord = keys[0];
  currentWordDisplay = Array.from(currentWord).map(c => c === " " ? " " : "_");

  updateDisplay();
  questionsLeft--;
}

function guessLetter(letter) {
  if (lettersGuessed.has(letter)) return;
  lettersGuessed.add(letter);

  let correct = false;
  currentWord.split("").forEach((c, i) => {
    if (c.toLowerCase() === letter.toLowerCase()) {
      currentWordDisplay[i] = c;
      correct = true;
    }
  });

  updateDisplay();

  if (correct) {
    toast(randomFrom(langStrings[window.settingsLocal.lang]?.successMessages || ["¡Bien!"]));
    stats.correct++;
    saveStats(stats);

    if (!currentWordDisplay.includes("_")) {
      setTimeout(nextWord, 800);
    }
  } else {
    mistakes++;
    updateHangmanSVG(mistakes);
    toast(randomFrom(langStrings[window.settingsLocal.lang]?.failMessages || ["Fallaste"]));
    stats.wrong++;
    saveStats(stats);

    if (mistakes >= maxMistakes) {
      showCorrectWord();
    }
  }
}

function showCorrectWord() {
  toast("❗ La palabra era: " + currentWord);
  setTimeout(nextWord, 2000);
}

function updateDisplay() {
  const wordArea = document.getElementById("wordArea");
  if (wordArea) wordArea.textContent = currentWordDisplay.join(" ");

  let lettersUsed = document.getElementById("lettersUsed");
  if (!lettersUsed) {
    lettersUsed = document.createElement("div");
    lettersUsed.id = "lettersUsed";
    document.getElementById("wordArea")?.appendChild(lettersUsed);
  }
  lettersUsed.textContent = [...lettersGuessed].join(" ");
}

function endGame() {
  toast("🏁 ¡Juego terminado!");
}

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

function loadCurrentVoc(vocObj) {
  window.currentVoc = vocObj || {};
}

/* ===========================
      INICIO DE APP
=========================== */

function initGameBindings() {
  document.getElementById("btnNew")?.addEventListener("click", startGame);
}

/* inicializamos teclado y bindings una vez cargado el DOM */
window.addEventListener("DOMContentLoaded", () => {
  initKeyboard();
  initGameBindings();
});
