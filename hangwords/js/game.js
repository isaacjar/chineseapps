let settings = loadSettings();
let langStrings = {};         // Se cargará por fetch
let voclistsIndex = [];
let currentList = null;
let currentWord = null;
let currentWordDisplay = [];
let mistakes = 0;
let maxMistakes = settings.lives;
let questionsLeft = settings.questions;
let lettersGuessed = new Set();
let stats = loadStats();

/* ===========================
      CARGA DE lang.json
=========================== */
async function loadLang() {
  try {
    const res = await fetch("js/lang.json");
    langStrings = await res.json();
    console.log("✓ lang.json cargado");
  } catch(e) {
    console.error("Error al cargar lang.json", e);
  }
}

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

function saveSettings(newSettings) {
  localStorage.setItem("hangmanSettings", JSON.stringify(newSettings));
}

function loadSettings() {
  let saved = localStorage.getItem("hangmanSettings");
  if (saved) return JSON.parse(saved);
  return { lang: "es", lives: 6, questions: 10 };
}

function saveStats(stats) {
  localStorage.setItem("hangmanStats", JSON.stringify(stats));
}

function loadStats() {
  let stored = localStorage.getItem("hangmanStats");
  if (stored) return JSON.parse(stored);
  return { correct: 0, wrong: 0 };
}

/* ===========================
      HANGMAN SVG
=========================== */

function updateHangmanSVG(parts) {
  document.querySelectorAll(".hangman-part").forEach((el, index) => {
    el.style.opacity = index < parts ? "1" : "0";
  });
}

/* ===========================
      CARGA LISTAS
=========================== */

async function loadVoclistsIndex() {
  try {
    const res = await fetch("vocabulary/index.js");
    const text = await res.text();
    eval(text);
    voclistsIndex = window.voclistsIndex || [];
  } catch(e) {
    console.error("Error al cargar index.js", e);
  }
}

async function loadVocabulary(listFile) {
  try {
    const res = await fetch("vocabulary/" + listFile);
    const text = await res.text();
    let data = {};
    eval("data = " + text);
    return data;
  } catch(e) {
    console.error("Error al cargar vocabulario", e);
  }
}

/* ===========================
      FLUJO DEL JUEGO
=========================== */

async function startGame() {
  mistakes = 0;
  questionsLeft = settings.questions;
  lettersGuessed.clear();
  maxMistakes = settings.lives;

  updateHangmanSVG(0);

  let selected = document.getElementById("voclist").value;
  currentList = await loadVocabulary(selected);

  nextWord();
}

function nextWord() {
  if (questionsLeft <= 0) {
    endGame();
    return;
  }

  let keys = Object.keys(currentList);
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
    toast(
      randomFrom(langStrings[settings.lang]?.successMessages || ["¡Bien!"])
    );
    stats.correct++;
    saveStats(stats);

    if (!currentWordDisplay.includes("_")) {
      setTimeout(nextWord, 800);
    }

  } else {
    mistakes++;
    updateHangmanSVG(mistakes);

    toast(
      randomFrom(langStrings[settings.lang]?.failMessages || ["Fallaste"])
    );

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
  document.getElementById("word").textContent = currentWordDisplay.join(" ");
  document.getElementById("lettersUsed").textContent = [...lettersGuessed].join(" ");
}

function endGame() {
  toast("🏁 ¡Juego terminado!");
}

/* ===========================
      INICIO DE LA APP
=========================== */

window.addEventListener("DOMContentLoaded", async () => {
  await loadLang();
  await loadVoclistsIndex();
  document.getElementById("startBtn").addEventListener("click", startGame);
});
