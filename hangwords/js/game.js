/* game.js — modo palabra a palabra + modo aprendizaje */

let currentWord = null,
    currentWordObj = null,
    currentWordDisplay = [],
    mistakes = 0,
    maxMistakes = 7,
    lettersGuessed = new Set(),
    usedWords = [],
    roundActive = false,
    roundFinished = false,
    stats = loadStats();

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);
const randomFrom = a => a[Math.floor(Math.random() * a.length)];
const normalize = c => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function saveStats() {
  localStorage.setItem("hangmanStats", JSON.stringify(stats));
}

function loadStats() {
  const s = JSON.parse(localStorage.getItem("hangmanStats") || "{}");
  return { score: s.score || 0, correct: s.correct || 0, wrong: s.wrong || 0 };
}

/* ================= VOCABULARIO ================= */
function hasVocabularyLoaded() {
  if (window.useCustomWords && Array.isArray(window.customWordList) && window.customWordList.length) {
    return true;
  }
  if (window.currentVoc && Object.keys(window.currentVoc).length) {
    return true;
  }
  return false;
}

function setCustomVocabulary(words) {
  if (!Array.isArray(words) || !words.length) return;

  window.customWordList = words;
  window.useCustomWords = true;

  // eliminamos estado de “seleccione vocabulario”
  window.currentVoc = null;

  const hint = $("selectVocHint");
  hint?.classList.add("hidden");

  updateNewButtonState();
}

/* ================= DISPLAY ================= */
function updateDisplay() {
  $("wordArea") && ($("wordArea").innerHTML = currentWordDisplay.join(" "));
  $("score") && ($("score").textContent = stats.score);
  $("lives") && ($("lives").textContent = maxMistakes - mistakes);
}

const resetWordStyles = () => {
  $("wordArea")?.classList.remove("word-success", "word-fail");
  $("learningBox")?.classList.add("hidden");
};

/* ================= HANGMAN SVG ================= */
function updateHangmanSVG(stage) {
  const svg = $("hangmanSVG");
  if (!svg) return;
  svg.innerHTML = "";

  const line = (x1, y1, x2, y2, w) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);
    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);
    l.setAttribute("stroke", "black");
    l.setAttribute("stroke-width", w);
    svg.appendChild(l);
  };

  const circle = (cx, cy, r, w) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cy);
    c.setAttribute("r", r);
    c.setAttribute("stroke", "black");
    c.setAttribute("stroke-width", w);
    c.setAttribute("fill", "none");
    svg.appendChild(c);
  };

  if (stage >= 1) line(10, 190, 90, 190, 4);
  if (stage >= 2) line(50, 190, 50, 20, 4);
  if (stage >= 3) line(50, 20, 120, 20, 4);
  if (stage >= 4) line(120, 20, 120, 50, 3);
  if (stage >= 5) circle(120, 70, 20, 3);
  if (stage >= 6) line(120, 90, 120, 140, 3);
  if (stage >= 7) line(120, 110, 90, 90, 3);
  if (stage >= 8) line(120, 110, 150, 90, 3);
  if (stage >= 9) line(120, 140, 90, 170, 3);
  if (stage >= 10) line(120, 140, 150, 170, 3);
}

/* ================= TECLADO ================= */
function initKeyboard() {
  const k = $("keyboard");
  if (!k) return;
  k.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => {
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
  if (Array.isArray(customList)) {
    setCustomVocabulary(customList);
  }

  maxMistakes = window.settingsLocal?.lives || 7;
  usedWords = [];
  roundActive = false;
  roundFinished = false;
  updateHangmanSVG(0);
  updateDisplay();
}

function startNewRound() {
  if (!hasVocabularyLoaded()) {
    toast("Primero cargue un listado de vocabulario");
    return;
  }

  if (roundActive && !confirm("¿Desea interrumpir la partida actual?")) return;

  mistakes = 0;
  lettersGuessed.clear();
  roundActive = true;
  roundFinished = false;
  resetKeyboard();
  resetWordStyles();
  updateHangmanSVG(0);
  nextWord();
}

function nextWord() {
  const voc = (window.useCustomWords && Array.isArray(window.customWordList))
    ? window.customWordList.map(w => ({ pin: w }))
    : Object.values(window.currentVoc || {});

  const words = voc.filter(v => v.pin && v.pin.replace(/\s/g, "").length >= 5);
  if (!words.length) return;

  let avail = words.filter(w => !usedWords.includes(w.pin));
  if (!avail.length) {
    usedWords = [];
    avail = words;
  }

  currentWordObj = randomFrom(avail);
  currentWord = currentWordObj.pin;
  usedWords.push(currentWord);

  currentWordDisplay = [...currentWord].map(c => (c === " " ? " " : "_"));
  updateDisplay();
}

/* ================= LETRAS ================= */
function guessLetter(letter) {
  if (!roundActive || lettersGuessed.has(letter)) return;
  lettersGuessed.add(letter);

  let hit = false;
  [...currentWord].forEach((c, i) => {
    if (normalize(c) === normalize(letter)) {
      currentWordDisplay[i] = c;
      hit = true;
    }
  });

  const btn = [...document.querySelectorAll(".key")]
    .find(b => normalize(b.textContent) === normalize(letter));

  if (btn) {
    btn.disabled = true;
    btn.classList.add(hit ? "correct" : "wrong");
  }

  hit ? onHit() : onFail();
}

function onHit() {
  updateDisplay();
  if (!currentWordDisplay.includes("_")) finishRound(true);
}

function onFail() {
  mistakes++;
  updateHangmanSVG(mistakes);
  updateDisplay();
  if (mistakes >= maxMistakes) finishRound(false);
}

/* ================= FIN DE RONDA ================= */
function finishRound(win) {
  roundActive = false;
  roundFinished = true;
  document.querySelectorAll(".key").forEach(b => (b.disabled = true));

  const wordArea = $("wordArea");

  if (win) {
    stats.score += currentWord.replace(/\s/g, "").length;
    stats.correct++;
    wordArea?.classList.add("word-success");
    setTimeout(() => wordArea?.classList.remove("word-success"), 400);
  } else {
    stats.wrong++;
    revealWrongLetters();
    wordArea?.classList.add("word-fail");
  }

  saveStats();
  showLearningInfo();
}

function revealWrongLetters() {
  const display = [...currentWord].map((c, i) => {
    if (c === " ") return " ";
    if (currentWordDisplay[i] !== "_") return c;
    return `<span style="color:red">${c}</span>`;
  });
  $("wordArea").innerHTML = display.join("");
}

/* ================= APRENDIZAJE ================= */
function showLearningInfo() {
  const box = $("learningBox");
  if (!box || !currentWordObj) return;
  const { ch, pin, en, es } = currentWordObj;
  if (!ch) return;
  box.innerHTML = `<div><b>${ch} [ ${pin} ]</b> ${en} - ${es}</div>`;
  box.classList.remove("hidden");
}

/* ================= BOTÓN NEW ================= */
function updateNewButtonState() {
  const btn = $("btnNew");
  if (!btn) return;

  const enabled = hasVocabularyLoaded();
  btn.disabled = !enabled;
  btn.classList.toggle("disabled", !enabled);
}

/* ================= BINDINGS ================= */
const safe = (id, fn) => {
  const el = $(id);
  if (!el || typeof fn !== "function") return;
  el.addEventListener("click", fn);
};

safe("btnNew", startNewRound);

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {
  initKeyboard();
  startGame();
  updateNewButtonState();

  if (hasVocabularyLoaded()) {
    startNewRound();
  }
});
