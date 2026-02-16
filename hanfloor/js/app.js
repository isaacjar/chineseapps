// app.js

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = null;
let selectedVocab = null;
let usedWords = new Set(); // Palabras ya usadas globalmente en el juego
let correctAnswers = { 1: 0, 2: 0 };

// ---------------------
// INTEGRACIÓN DE GAMES
// ---------------------
const Game1 = { 
  mode: "hanzi-to-pinyin",

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;

    // 🔹 Filtrar vocab no usado aún
    let candidates = this.vocab.filter(w => !usedWords.has(w.pinyin));
    if (candidates.length === 0) {
      usedWords.clear(); // reset si se acaban todas
      candidates = this.vocab.slice();
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
};

const Game2 = {
  mode: "hanzi-to-meaning",

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;

    const lang = Settings.data.lang || "en";

    let candidates = this.vocab.filter(w => !usedWords.has(w.meaning[lang]));
    if (candidates.length === 0) {
      usedWords.clear();
      candidates = this.vocab.slice();
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
};

const Game3 = {
  mode: "meaning-to-hanzi",

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;

    let candidates = this.vocab.filter(w => !usedWords.has(w.hanzi));
    if (candidates.length === 0) {
      usedWords.clear();
      candidates = this.vocab.slice();
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
};

// ---------------------
// DOMContentLoaded
// ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    Settings.load(); // Solo log de settings cargados
    UI.init();

    await loadVocabList();

    // ---------------------
    // Parámetros URL y persistencia
    // ---------------------
    const urlParams = new URLSearchParams(window.location.search);
    const paramGame = Number(urlParams.get("game"));
    const paramVocab = urlParams.get("vocab");
    const paramP1 = urlParams.get("p1");
    const paramP2 = urlParams.get("p2");

    const lastGame = paramGame || Number(localStorage.getItem("lastGame"));
    let lastVocab = paramVocab || localStorage.getItem("lastVocab");

    // ---------------------
    // Time selection
    // ---------------------
    if (UI.timeBtns) {
      UI.timeBtns.forEach(btn => {
        btn.onclick = () => {
          const t = Number(btn.dataset.time);
    
          Settings.data.time = t;
          Settings.save();
    
          UI.setActiveTimeBtn(t);
        };
      });
    
      // Activar el tiempo guardado al abrir el menú
      UI.setActiveTimeBtn(Settings.data.time);
    }
    
    // ---------------------
    // Setear vocabulario
    // ---------------------
    if (UI.vocabSelect && UI.vocabSelect.options.length > 0) {
      const exists = Array.from(UI.vocabSelect.options)
        .some(opt => opt.value === lastVocab);

      if (!exists) {
        lastVocab = localStorage.getItem("lastVocab") ||
                    UI.vocabSelect.options[0].value;
      }

      UI.vocabSelect.value = lastVocab;

      try {
        selectedVocab = await loadVocabFile(lastVocab);
        localStorage.setItem("lastVocab", lastVocab);
      } catch {
        UI.showMenu();
        return;
      }
    }

    // ---------------------
    // Tipo de juego
    // ---------------------
    if (lastGame) {
      currentGame = lastGame;
      UI.setActiveGameBtn(currentGame);
    }

    // ---------------------
    // Nombres
    // ---------------------
    const p1 = paramP1 || localStorage.getItem("lastPlayer1") || "Player 1";
    const p2 = paramP2 || localStorage.getItem("lastPlayer2") || "Player 2";

    UI.player1Input.value = p1;
    UI.player2Input.value = p2;
    UI.setNames({ jugador1: p1, jugador2: p2 });

    // ---------------------
    // Toggle tipo de juego
    // ---------------------
    UI.gameTypeBtns.forEach(btn => {
      btn.onclick = () => {
        currentGame = Number(btn.dataset.game);
        UI.setActiveGameBtn(currentGame);
      };
    });

    // ---------------------
    // START desde popup
    // ---------------------
    UI.btnStartGame.onclick = async () => {
      
      UI.goFullscreen(); // Pantalla completa
      
      if (!currentGame) {
        alert("Please select a game type");
        return;
      }

      const vocabKey = UI.vocabSelect.value;
      if (!vocabKey) {
        alert("Please select a vocabulary list");
        return;
      }

      // 🔹 Leer nombres actuales de los inputs
      const p1 = UI.player1Input.value.trim() || "Player 1";
      const p2 = UI.player2Input.value.trim() || "Player 2";

      // 🔹 Guardar en localStorage
      localStorage.setItem("lastPlayer1", p1);
      localStorage.setItem("lastPlayer2", p2);
    
      // 🔹 Actualizar nombres visibles
      UI.setNames({ jugador1: p1, jugador2: p2 });
          
      selectedVocab = await loadVocabFile(vocabKey);

      localStorage.setItem("lastGame", currentGame);
      localStorage.setItem("lastVocab", vocabKey);

      usedWords.clear();
      startGame(currentGame, selectedVocab);
    };

    if (paramGame || paramVocab || paramP1 || paramP2) {
      usedWords.clear();
      startGame(currentGame, selectedVocab);
    } else {
      UI.showMenu();
    }

  } catch {
    alert("Failed to load vocabulary. Please check your internet connection.");
  }
});

// ---------------------
// Cargar index.js (voclists)
// ---------------------
async function loadVocabList(retries = 10, delay = 300) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";
    script.async = true;

    script.onload = () => {
      let attempt = 0;

      const check = () => {
        if (typeof voclists !== "undefined" && Array.isArray(voclists)) {
          UI.vocabSelect.innerHTML = "";
          voclists.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.filename;
            opt.textContent = v.title;
            UI.vocabSelect.appendChild(opt);
          });
          resolve();
          return;
        }

        attempt++;
        attempt >= retries ? reject() : setTimeout(check, delay);
      };

      check();
    };

    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

// ---------------------
// Cargar vocab JSON
// ---------------------
async function loadVocabFile(filename) {
  const url = `https://isaacjar.github.io/chineseapps/hanfloor/voc/${filename}.json`;

  const res = await fetch(url);

  // 🔹 Caso 404 / 500 / etc.
  if (!res.ok) {
    throw new Error("VOCAB_NOT_FOUND");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    // 🔹 Caso HTML en vez de JSON
    throw new Error("VOCAB_INVALID_JSON");
  }

  return normalizeVocab(data);
}

// ---------------------
// Normalizar
// ---------------------
function normalizeVocab(list) {
  return list.map(w => ({
    hanzi: w.ch,
    pinyin: w.pin,
    meaning: {
      en: w.en,
      es: w.es
    }
  }));
}

function renderHanzi(word) {
  if (Settings.data.pinyin) {
    return `${word.hanzi}  <span class="pinyin">[ ${word.pinyin} ]</span>`;
  }
  return word.hanzi;
}

// ---------------------
// STOP GAME
// ---------------------
function stopGame() {
  // ⏱️ parar temporizador
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 🔄 limpiar estado de juego
  currentQuestion = null;
  window.Game = null;
  usedWords.clear();

  // 🧼 limpiar UI de preguntas y opciones
  UI.question1.innerHTML = "";
  UI.question2.innerHTML = "";
  UI.options1.innerHTML = "";
  UI.options2.innerHTML = "";

  // 🔁 reset jugadores a estado neutro
  UI.player1.classList.remove("active", "inactive", "fail");
  UI.player2.classList.remove("active", "inactive", "fail");
}

// ---------------------
// START GAME
// ---------------------
function startGame(gameNumber, vocabList) {
  UI.hideMenu();
  
  currentPlayer = 1;
  correctAnswers[1] = 0;
  correctAnswers[2] = 0;
  
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  window.Game =
    gameNumber === 1 ? Game1 :
    gameNumber === 2 ? Game2 :
    gameNumber === 3 ? Game3 : Game4;

  window.Game.vocab = vocabList;
  window.Game.correctCount = 0;

  UI.showCountdown(() => {
    startTimer();
    loadQuestion();
  });

}

// ---------------------
// LOAD QUESTION
// ---------------------
function loadQuestion() {
  currentQuestion = window.Game.getQuestion();

  if (!currentQuestion || (!currentQuestion.hanzi && !currentQuestion.meaning)) {
    usedWords.clear();
    currentQuestion = window.Game.getQuestion();
  }

  if (!currentQuestion) return;

  let options, correct, questionText;
  const lang = Settings.data.lang || "en"; // 'en' o 'es'

  switch (window.Game.mode) {
    case "hanzi-to-pinyin":
      options = generatePinyinOptions(currentQuestion);
      correct = currentQuestion.pinyin;
      questionText = currentQuestion.hanzi;
      break;

    case "hanzi-to-meaning":
      options = generateMeaningOptions(currentQuestion, lang);
      correct = currentQuestion.meaning[lang];
      // Mostrar Hanzi + pinyin con estilo si está activado
      questionText = Settings.data.pinyin
        ? renderHanzi(currentQuestion)
        : currentQuestion.hanzi;
      break;

    case "meaning-to-hanzi":
      options = generateHanziOptions(currentQuestion);
      correct = currentQuestion.hanzi;        // solo valor puro
      questionText = currentQuestion.meaning[lang]; // pregunta = significado según idioma
      break;

    default:
      console.warn("Unknown game mode:", window.Game.mode);
      return;
  }

  // 🔹 Renderizar opciones usando btn.dataset.value en vez de innerHTML
  UI.renderQuestion(
    currentPlayer,
    questionText,
    options,
    sel => onAnswer(sel, correct)
  );

  // Deshabilitar botones del jugador inactivo
  const inactiveContainer = currentPlayer === 1 ? UI.options2 : UI.options1;
  [...inactiveContainer.children].forEach(btn => btn.disabled = true);

  // Habilitar botones del jugador activo
  const activeContainer = currentPlayer === 1 ? UI.options1 : UI.options2;
  [...activeContainer.children].forEach(btn => btn.disabled = false);
}

// ---------------------
// Opciones MEANING
// ---------------------
function generateMeaningOptions(word, lang) {
  usedWords.add(word.meaning[lang]);

  // Candidatos de la misma lista, excluyendo la correcta
  let candidates = window.Game.vocab
    .filter(w => w !== word)
    .map(w => w.meaning[lang]);

  shuffleArray(candidates);

  return shuffleArray([word.meaning[lang], ...candidates.slice(0, 3)]);
}

// --------------------- Opciones HANZI ---------------------
function generateHanziOptions(word) {
  usedWords.add(word.hanzi);

  // 1️⃣ candidatos misma longitud
  let candidates = window.Game.vocab
    .filter(w => w.hanzi !== word.hanzi && w.hanzi.length === word.hanzi.length)
    .map(w => w.hanzi);

  // 2️⃣ si no hay suficientes, relajar condición
  if (candidates.length < 3) {
    candidates = window.Game.vocab
      .filter(w => w.hanzi !== word.hanzi)
      .map(w => w.hanzi);
  }

  shuffleArray(candidates);

  return shuffleArray([word.hanzi, ...candidates.slice(0, 3)]);
}
// ---------------------  Opciones PINYIN  ---------------------
function generatePinyinOptions(word) {
  // 1️⃣ candidatos de hanzi misma longitud
  let candidates = window.Game.vocab
    .filter(w => w.hanzi !== word.hanzi && w.hanzi.length === word.hanzi.length && w.pinyin !== word.pinyin)
    .map(w => w.pinyin);

  // 2️⃣ fallback si no hay suficientes
  if (candidates.length < 3) {
    candidates = window.Game.vocab
      .filter(w => w.hanzi !== word.hanzi)
      .map(w => w.pinyin);
  }

  shuffleArray(candidates);

  return shuffleArray([word.pinyin, ...candidates.slice(0, 3)]);
}

// ---------------------
// Mezclar
// ---------------------
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ---------------------
// RESPUESTA
// ---------------------
function onAnswer(selected, correct) {
  const activeContainer = currentPlayer === 1 ? UI.options1 : UI.options2;

  // ⚡ Comprobar si el botón pulsado pertenece al jugador activo
  if (![...activeContainer.children].some(btn => btn.dataset.value === selected)) {
    return;
  }

  // Deshabilitar botones del jugador activo inmediatamente
  [...activeContainer.children].forEach(btn => btn.disabled = true);

  // Pintar botones: correcto en verde, incorrecto en rojo
  [...activeContainer.children].forEach(btn => {
    if (btn.dataset.value === correct) {
      btn.classList.add("correct");
      correctAnswers[currentPlayer]++;
    } else if (btn.dataset.value === selected) {
      btn.classList.add("incorrect");
    }
  });

  // 🔹 Comparación mínima según modo
  let isCorrect;
  if (window.Game.mode === "hanzi-to-pinyin") {
    const normalize = s => s.trim().toLowerCase();
    isCorrect = normalize(selected) === normalize(correct);
  } else {
    // Game2 y Game3: comparar literalmente
    isCorrect = selected === correct;
  }

  if (isCorrect) {
    UI.playOk();
    setTimeout(switchPlayer, 500);
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    UI.markFail(currentPlayer, 800);
    setTimeout(loadQuestion, 800);
  }
}

// ---------------------
// GUARDAR ESTADISTICAS
// ---------------------
function saveGameResult({ name, points, correct }) {
  const key = "hanfloorHistory";
  const list = JSON.parse(localStorage.getItem(key) || "[]");

  list.push({
    name,
    points,
    answers: correct,
    date: Date.now()
  });

  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.answers - a.answers;
  });

  list.splice(20); // solo top 20

  localStorage.setItem(key, JSON.stringify(list));
}

// ---------------------
// WIN CONFETTI
// ---------------------
function launchConfetti(duration = 2000) {
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ---------------------
// SWITCH PLAYER
// ---------------------
function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  UI.setActive(currentPlayer);
  loadQuestion();
}

// ---------------------
// TIMER
// ---------------------
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    UI.decreaseTime(currentPlayer);
    if (UI.getTime(currentPlayer) <= 0) {
      endGame(currentPlayer === 1 ? 2 : 1);
    }
  }, 1000);
}

// ---------------------
// END GAME
// ---------------------
function endGame(winner) {
  clearInterval(timerInterval);

  const secondsLeft = UI.getTime(winner);
  const points = secondsLeft * 10;
  const name = winner === 1
    ? UI.name1.textContent
    : UI.name2.textContent;

  launchConfetti();
  saveGameResult({ name, points, correct: correctAnswers[winner] });
  UI.showWinPopup({ name, points });
}
