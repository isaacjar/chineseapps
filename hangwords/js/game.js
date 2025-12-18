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

/* ================= HANGMAN SVG ================= */
function updateHangmanSVG(stage) {
  const svg = $("hangmanSVG");
  if (!svg) return;
  svg.innerHTML = "";

  const line = (x1, y1, x2, y2, w, shadow = false) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    if (shadow) {
      l.setAttribute("x1", x1 + 2);
      l.setAttribute("y1", y1 + 2);
      l.setAttribute("x2", x2 + 2);
      l.setAttribute("y2", y2 + 2);
      l.setAttribute("stroke", "#999");
      l.setAttribute("stroke-width", w + 1);
    } else {
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
      l.setAttribute("stroke", "black");
      l.setAttribute("stroke-width", w);
    }
    svg.appendChild(l);
  };

  const circle = (cx, cy, r, w, shadow = false) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    if (shadow) {
      c.setAttribute("cx", cx + 2);
      c.setAttribute("cy", cy + 2);
      c.setAttribute("r", r);
      c.setAttribute("stroke", "#999");
      c.setAttribute("stroke-width", w + 1);
      c.setAttribute("fill", "#ddd");
    } else {
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
      c.setAttribute("r", r);
      c.setAttribute("stroke", "black");
      c.setAttribute("stroke-width", w);
      c.setAttribute("fill", "none");
    }
    svg.appendChild(c);
  };

  if (stage >= 1) { line(10, 190, 90, 190, 4, true); line(10, 190, 90, 190, 4); }
  if (stage >= 2) { line(50, 190, 50, 20, 4, true); line(50, 190, 50, 20, 4); }
  if (stage >= 3) { line(50, 20, 120, 20, 4, true); line(50, 20, 120, 20, 4); }
  if (stage >= 4) { line(120, 20, 120, 50, 3, true); line(120, 20, 120, 50, 3); }
  if (stage >= 5) { circle(120, 70, 20, 3, true); circle(120, 70, 20, 3); }
  if (stage >= 6) { line(120, 90, 120, 140, 3, true); line(120, 90, 120, 140, 3); }
  if (stage >= 7) { line(120, 110, 90, 90, 3, true); line(120, 110, 90, 90, 3); }
  if (stage >= 8) { line(120, 110, 150, 90, 3, true); line(120, 110, 150, 90, 3); }
  if (stage >= 9) { line(120, 140, 90, 170, 3, true); line(120, 140, 90, 170, 3); }
  if (stage >= 10) { line(120, 140, 150, 170, 3, true); line(120, 140, 150, 170, 3); }
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
