console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = null;
let selectedVocab = null;

// ---------------------
// DOMContentLoaded
// ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("DOM listo");

    Settings.load();
    UI.init();
    UI.setNames(Settings.data);

    // Cargar listado de vocabularios
    await loadVocabList();

    // ---------------------
    // Restaurar últimas opciones
    // ---------------------
    const lastGame = Number(localStorage.getItem("lastGame"));
    const lastVocab = localStorage.getItem("lastVocab");

    if (lastGame) {
      currentGame = lastGame;
      UI.setActiveGameBtn(currentGame);
    }

    if (lastVocab && UI.vocabSelect) {
      UI.vocabSelect.value = lastVocab;
    }

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

      const p1 = UI.player1Input.value.trim() || "Player 1";
      const p2 = UI.player2Input.value.trim() || "Player 2";
      const vocabKey = UI.vocabSelect.value;

      if (!vocabKey) {
        alert("Please select a vocabulary list");
        return;
      }

      // Cargar vocabulario real
      selectedVocab = await loadVocabFile(vocabKey);

      UI.setNames({ jugador1: p1, jugador2: p2 });

      // Persistencia
      localStorage.setItem("lastGame", currentGame);
      localStorage.setItem("lastVocab", vocabKey);

      startGame(currentGame, selectedVocab);
    };

    // ---------------------
    // URL params (opcional)
    // ---------------------
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = Number(urlParams.get("game"));

    if (gameParam) {
      currentGame = gameParam;
      startGame(currentGame);
    } else {
      UI.showMenu();
    }

  } catch (e) {
    console.error("Error inicializando app:", e);
    alert("Failed to load vocabulary.");
  }
});

// ---------------------
// Cargar index.js (voclits)
// ---------------------
async function loadVocabList() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";

    script.onload = () => {
      if (!window.voclits || !UI.vocabSelect) {
        reject("voclits not found");
        return;
      }

      UI.vocabSelect.innerHTML = "";

      window.voclits.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.filename;      // ej: H1L1a4
        opt.textContent = v.title;   // ej: HSK 1 01-04
        UI.vocabSelect.appendChild(opt);
      });

      resolve();
    };

    script.onerror = () => reject("Error loading vocab index");
    document.body.appendChild(script);
  });
}

// ---------------------
// Cargar JSON real del vocabulario
// ---------------------
async function loadVocabFile(filename) {
  const url = `https://isaacjar.github.io/chineseapps/hanfloor/voc/${filename}full.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Vocabulary file not found");

  const data = await res.json();

  if (!Array.isArray(data) || data.length < 4) {
    throw new Error("Vocabulary list invalid or too small");
  }

  return normalizeVocab(data);
}

// ---------------------
// Normalizar vocabulario
// ---------------------
function normalizeVocab(list) {
  return list.map(w => ({
    hanzi: w.ch,
    pinyin: w.pin,
    meaning: w.en,
    meaning_es: w.es
  }));
}

// ---------------------
// START GAME
// ---------------------
function startGame(gameNumber, vocabList = null) {
  UI.hideMenu();
  console.log("START GAME", gameNumber);

  currentPlayer = 1;
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  switch (gameNumber) {
    case 1: window.Game = Game1; break;
    case 2: window.Game = Game2; break;
    case 3: window.Game = Game3; break;
    case 4: window.Game = Game4; break;
    default: window.Game = Game1;
  }

  if (vocabList) {
    window.Game.vocab = vocabList;
  }

  if (!window.Game.vocab || window.Game.vocab.length < 4) {
    alert("The game needs at least 4 words");
    UI.showMenu();
    return;
  }

  startTimer();
  loadQuestion();
}

// ---------------------
// LOAD QUESTION
// ---------------------
function loadQuestion() {
  currentQuestion = window.Game.getQuestion();
  UI.renderQuestion(
    currentPlayer,
    currentQuestion.text,
    currentQuestion.options,
    onAnswer
  );
}

// ---------------------
// HANDLE ANSWER
// ---------------------
function onAnswer(selected) {
  const container = currentPlayer === 1 ? UI.options1 : UI.options2;
  [...container.children].forEach(btn => btn.disabled = true);

  if (selected === currentQuestion.correct) {
    UI.playOk();
    setTimeout(switchPlayer, 200);
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    setTimeout(loadQuestion, 300);
  }
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
  UI.showWinner(winner);
}
