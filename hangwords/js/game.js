/* game.js — modo palabra a palabra + modo aprendizaje */

let currentWord = null,
    currentWordRaw = null,
    currentWordObj = null,
    currentWordDisplay = [],
    mistakes = 0,
    maxMistakes = 10,
    lettersGuessed = new Set(),
    usedWords = [],
    roundActive = false,
    roundFinished = false,
    wordsSolved = 0,
    lettersHitCount = 0,
    stats = loadStats();

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);
const randomFrom = a => a[Math.floor(Math.random() * a.length)];
const normalize = c => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const stripSymbols = w => w.replace(/[()'’]/g, "");

function saveStats() {
  localStorage.setItem("hangmanStats", JSON.stringify(stats));
}

function loadStats() {
  const s = JSON.parse(localStorage.getItem("hangmanStats") || "{}");
  return { score: s.score || 0, correct: s.correct || 0, wrong: s.wrong || 0 };
}

function updateDisplay() {
  const wordArea = $("wordArea");
  if (wordArea) {
    wordArea.innerHTML = currentWordDisplay.join(" ");
  }

  const scoreEl = $("score");
  if (scoreEl) {
    scoreEl.textContent = stats.score;
  }

  const livesEl = $("lives");
  if (livesEl) {
    livesEl.textContent = maxMistakes - mistakes;
  }
}

/* ================= TECLADO ================= */
function shouldShowÑ() {
  if (window.settingsLocal?.lang === "ES") return true;
  return (window.customWordList || []).some(w => /ñ/i.test(w));
}

function initKeyboard() {
  const k = $("keyboard");
  if (!k) return;
  k.innerHTML = "";

  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  if (shouldShowÑ()) letters.splice(14, 0, "Ñ");

  letters.forEach(l => {
    const b = document.createElement("button");
    b.className = "key";
    b.textContent = l;
    b.onclick = () => guessLetter(l);
    k.appendChild(b);
  });
}

const resetKeyboard = () =>
  document.querySelectorAll(".key").forEach(b => {
    b.disabled = false;
    b.classList.remove("correct", "wrong");
  });

/* ================= JUEGO ================= */
function startGame(customList) {
  maxMistakes = window.settingsLocal?.lives || 10;
  usedWords = [];
  roundActive = false;
  roundFinished = false;
  updateHangmanSVG(0);
  updateDisplay();
  initKeyboard();
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {
  initKeyboard();
  startGame();
});
