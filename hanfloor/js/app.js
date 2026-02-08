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

    // Cargar vocabulario remoto
    await loadVocabList();

    // Restaurar últimas opciones
    const lastGame = Number(localStorage.getItem("lastGame"));
    const lastVocab = localStorage.getItem("lastVocab");

    if (lastGame) {
      currentGame = lastGame;
      UI.setActiveGameBtn(currentGame);
    }

    if (lastVocab && UI.vocabSelect) {
      UI.vocabSelect.value = lastVocab;
      selectedVocab = window.Voc?.[lastVocab] || null;
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
    UI.btnStartGame.onclick = () => {
      if (!currentGame) {
        alert("Please select a game type");
        return;
      }

      const p1 = UI.player1Input.value.trim() || "Player 1";
      const p2 = UI.player2Input.value.trim() || "Player 2";
      const vocabKey = UI.vocabSelect.value;

      selectedVocab = vocabKey && window.Voc ? window.Voc[vocabKey] : null;

      UI.setNames({ jugador1: p1, jugador2: p2 });

      // Persistencia
      UI.saveSettings(currentGame, vocabKey, p1, p2);

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
// Cargar vocabulario remoto
// ---------------------
async function loadVocabList() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";

    script.onload = () => {
      if (window.Voc && UI.vocabSelect) {
        UI.vocabSelect.innerHTML = "";
        Object.keys(window.Voc).forEach(key => {
          const opt = document.createElement("option");
          opt.value = key;
          opt.textContent = key;
          UI.vocabSelect.appendChild(opt);
        });
        resolve();
      } else reject("Voc vacío");
    };

    script.onerror = () => reject("Error cargando vocabulario");
    document.body.appendChild(script);
  });
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

  if (vocabList && Array.isArray(vocabList) && vocabList.length >= 4) {
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
