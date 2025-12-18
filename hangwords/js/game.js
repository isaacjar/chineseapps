/* game.js — modo palabra a palabra + modo aprendizaje */

/* ================= ESTADO GLOBAL ================= */
let currentWord = null,
    currentWordObj = null,
    currentWordDisplay = [],
    mistakes = 0,
    maxMistakes = 10,
    lettersGuessed = new Set(),
    usedWords = [],
    roundActive = false,
    roundFinished = false,
    wordsSolved = 0,      // 🏆 palabras acertadas del listado actual
    lettersHitCount = 0,  // 🎯 letras correctas en la palabra actual
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
  if (window.useCustomWords && Array.isArray(window.customWordList) && window.customWordList.length) return true;
  if (window.currentVoc && Object.keys(window.currentVoc).length) return true;
  return false;
}

function onVocabularyLoaded(words) {
  if (!Array.isArray(words) || !words.length) return;

  window.customWordList = words;
  window.useCustomWords = true;
  window.currentVoc = null; // eliminamos vocabulario anterior

  $("selectVocHint")?.classList.add("hidden");
  if ($("btnListWords")) $("btnListWords").style.display = "none";

  wordsSolved = 0;
  lettersHitCount = 0;
  updateCounters();

  updateNewButtonState();
}

/* ================= DISPLAY ================= */
function updateDisplay() {
  $("wordArea") && ($("wordArea").innerHTML = currentWordDisplay.join(" "));
  $("score") && ($("score").textContent = stats.score);
  $("lives") && ($("lives").textContent = maxMistakes - mistakes);  
}

function updateCounters() {
  const solvedEl = $("counterWordsSolved");
  const lettersEl = $("counterLettersHit");
  if (solvedEl) solvedEl.textContent = wordsSolved;
  if (lettersEl) lettersEl.textContent = lettersHitCount;
}

const resetWordStyles = () => {
  $("wordArea")?.classList.remove("word-success", "word-fail");
  $("learningBox")?.classList.add("hidden");
};

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
  if (Array.isArray(customList)) onVocabularyLoaded(customList);

  maxMistakes = window.settingsLocal?.lives || 10;
  usedWords = [];
  roundActive = false;
  roundFinished = false;

  window.updateHangmanSVG && updateHangmanSVG(0);
  updateDisplay();
}

function startNewRound() {
  if (!hasVocabularyLoaded()) {
    toast("Primero cargue un listado de vocabulario");
    return;
  }

  if (roundActive && !confirm("¿Desea interrumpir la palabra actual?")) return;

  mistakes = 0;
  lettersGuessed.clear();
  lettersHitCount = 0;
  roundActive = true;
  roundFinished = false;

  resetKeyboard();
  resetWordStyles();
  window.updateHangmanSVG && updateHangmanSVG(0);
  nextWord();
}

function nextWord() {
  const voc = (window.useCustomWords && Array.isArray(window.customWordList))
    ? window.customWordList.map(w => ({ pin: w }))
    : Object.values(window.currentVoc || {});

  const words = voc.filter(v => v.pin && v.pin.replace(/[\s'()]/g, "").length >= 5);
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
  lettersHitCount = 0;

  updateDisplay();
  updateCounters();
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
      lettersHitCount++;
    }
  });

  const btn = [...document.querySelectorAll(".key")]
    .find(b => normalize(b.textContent) === normalize(letter));

  if (btn) {
    btn.disabled = true;
    btn.classList.add(hit ? "correct" : "wrong");
  }

  updateCounters();
  hit ? onHit() : onFail();
}

function onHit() {
  updateDisplay();
  if (!currentWordDisplay.includes("_")) finishRound(true);
}

function onFail() {
  mistakes++;

  if (mistakes < maxMistakes) {
    // fallo normal → cae un bloque
    window.updateHangmanSVG && updateHangmanSVG(mistakes);
  } else {
    // último fallo → derrumbe final
    window.updateHangmanSVG && updateHangmanSVG(mistakes, false, true);
  }

  updateDisplay();

  if (mistakes >= maxMistakes) finishRound(false);
}

/* ================= FIN DE RONDA ================= */
function finishRound(win) {
  roundActive = false;
  roundFinished = true;
  document.querySelectorAll(".key").forEach(b => b.disabled = true);

  const wordArea = $("wordArea");

  if (win) {
    stats.score += currentWord.replace(/\s/g, "").length;
    stats.correct++;
    wordsSolved++;
    wordArea?.classList.add("word-success");
    setTimeout(() => wordArea?.classList.remove("word-success"), 400);

    // Animación final: torre intacta + confetti
    if (window.updateHangmanSVG) {
      updateHangmanSVG(0, true, false); // finalWin = true
    }
  } else {
    stats.wrong++;
    revealWrongLetters();
    wordArea?.classList.add("word-fail");

    // Animación final: derrumbe de torre
    if (window.updateHangmanSVG) {
      const mistakesMade = maxMistakes; // o la cantidad de errores actual
      updateHangmanSVG(mistakesMade, false, true); // finalLose = true
    }
  }

  updateCounters();
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
  btn.disabled = false;
  btn.classList.remove("disabled");
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
});
