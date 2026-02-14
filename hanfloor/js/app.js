// app.js

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = 2; // Meaning por defecto
let selectedVocab = null;
let usedWords = new Set(); // Palabras ya usadas globalmente en el juego

const GAME_TYPES = {
  meaning: { label: "Meaning", question: "hanzi", options: "meaning" },
  word: { label: "Word", question: "meaning", options: "hanzi" },
  pinyin: { label: "Pinyin", question: "hanzi", options: "pinyin" }
};

const GameController = {
  game: 2, // Meaning por defecto
  lang: "en",
  showPinyin: true,
  vocab: [],

  init(settings, vocabList) {
    this.game = Number(settings.game || 2);
    this.lang = settings.lang || "en";
    this.showPinyin = settings.pinyin;
    this.vocab = normalizeVocab(vocabList);
  },

  start() {
    console.log("Starting game:", this.game);

    switch (this.game) {
      case 1:
        Game1.start(this); 
        break;
      case 2:
        GameMeaning.start(this);
        break;
      case 3:
        GameWord.start(this);
        break;
      default:
        GameMeaning.start(this);
    }
  },

  getMeaning(word) {
    return this.lang === "es" ? word.meaning_es : word.meaning;
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
      if (!currentGame) {
        alert("Please select a game type");
        return;
      }

      const vocabKey = UI.vocabSelect.value;
      if (!vocabKey) {
        currentGame = 2; // Meaning por defecto
        UI.setActiveGameBtn(currentGame);
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
  const res = await fetch(
    `https://isaacjar.github.io/chineseapps/hanfloor/voc/${filename}full.json`
  );
  const data = await res.json();
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
    return `${word.hanzi} <span class="pinyin">[${word.pinyin}]</span>`;
  }
  return word.hanzi;
}

// ---------------------
// START GAME
// ---------------------
function startGame(gameNumber, vocabList) {
  UI.hideMenu();
  currentPlayer = 1;
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  // 🔹 Inicializamos GameController
  GameController.init({
    game: gameNumber,
    lang: Settings.data.lang,
    pinyin: Settings.data.pinyin
  }, vocabList);

  GameController.start(); // Esto asigna window.Game automáticamente

  startTimer();
  loadQuestion();
}

// ---------------------
// LOAD QUESTION
// ---------------------
function loadQuestion() {
  currentQuestion = window.Game.getQuestion();

  if (!currentQuestion || !currentQuestion.hanzi) {
    usedWords.clear();
    currentQuestion = window.Game.getQuestion();
  }

  if (!currentQuestion) return;

  let options, correct;

  if (window.Game.mode === "hanzi-to-pinyin") {
    options = generatePinyinOptions(currentQuestion);
    correct = currentQuestion.pinyin;
  } else {
    options = generateHanziOptions(currentQuestion);
    correct = currentQuestion.hanzi;
  }

  // Renderizar solo para el jugador activo
  const questionText =
    window.Game.mode === "hanzi-to-pinyin"
      ? currentQuestion.hanzi
      : renderHanzi(currentQuestion);
  
  UI.renderQuestion(
    currentPlayer,
    questionText,
    options,
    sel => onAnswer(sel, correct)
  );


  // Deshabilitar los botones del jugador inactivo
  const inactiveContainer = currentPlayer === 1 ? UI.options2 : UI.options1;
  [...inactiveContainer.children].forEach(btn => btn.disabled = true);

  // Habilitar los botones del jugador activo
  const activeContainer = currentPlayer === 1 ? UI.options1 : UI.options2;
  [...activeContainer.children].forEach(btn => btn.disabled = false);
}

// ---------------------
// Opciones HANZI
// ---------------------
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

// ---------------------
// Opciones PINYIN
// ---------------------
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

  // Ignorar si el botón pulsado no pertenece al jugador activo
  if (![...activeContainer.children].some(btn => btn.textContent === selected)) {
    return;
  }

  // Deshabilitar botones del jugador activo inmediatamente
  [...activeContainer.children].forEach(btn => btn.disabled = true);

  // Pintar botones: correcto en verde primavera, incorrecto en rojo pastel
  [...activeContainer.children].forEach(btn => {
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    } else if (btn.textContent === selected) {
      btn.classList.add("incorrect");
    }
  });

  const normalize = s => s.trim().toLowerCase(); // Se acepta por válido el pinyin igual
  
  // if (selected === correct) {
  if (normalize(selected) === normalize(correct)) {   
    UI.playOk();
    setTimeout(switchPlayer, 500); // un poco más de tiempo para ver el verde
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    UI.markFail(currentPlayer, 800);
    setTimeout(loadQuestion, 800); // tiempo para ver el rojo
  }
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
  UI.showWinPopup({ name, points });
}
