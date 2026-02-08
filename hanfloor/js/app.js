console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = 1; // juego seleccionado
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

    // Restaurar último tipo de juego usado
    const lastGame = localStorage.getItem("lastGame");
    if (lastGame) {
      currentGame = Number(lastGame);
      UI.setActiveGameBtn(currentGame);
    }

    // START button
    const btnStart = document.getElementById("btnStartGame");
    if (btnStart) btnStart.onclick = () => {
      if (!currentGame) {
        alert("Please select a game type!");
        return;
      }

      // Guardar nombres
      const p1 = UI.player1Input.value.trim() || "Player 1";
      const p2 = UI.player2Input.value.trim() || "Player 2";
      UI.setNames({ jugador1: p1, jugador2: p2 });

      // Guardar vocabulario seleccionado
      const sel = UI.vocabSelect.value;
      selectedVocab = sel && window.Voc ? window.Voc[sel] : null;

      UI.hideMenu();
      localStorage.setItem("lastGame", currentGame);
      startGame(currentGame, selectedVocab);
    };

    // Botones tipo de juego
    UI.gameTypeBtns.forEach(btn => {
      btn.onclick = () => {
        currentGame = Number(btn.dataset.game);
        UI.gameTypeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    // Mostrar popup si no se pasó game por URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get("game");
    const vocabParam = urlParams.get("vocab");

    if (gameParam) {
      currentGame = Number(gameParam);
      startGame(currentGame, vocabParam ? JSON.parse(decodeURIComponent(vocabParam)) : null);
    } else {
      UI.showMenu();
    }

  } catch (e) {
    console.error("Error inicializando app:", e);
    alert("Failed to load vocabulary. Check your internet or script URL.");
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
      if (window.Voc && Object.keys(window.Voc).length > 0 && UI.vocabSelect) {
        UI.vocabSelect.innerHTML = "";
        for (const key in window.Voc) {
          const opt = document.createElement("option");
          opt.value = key;
          opt.textContent = key;
          UI.vocabSelect.appendChild(opt);
        }
        resolve();
      } else {
        console.warn("window.Voc no tiene datos", window.Voc);
        reject("No se cargó 'Voc'");
      }
    };
    script.onerror = () => reject("Error cargando script remoto");
    document.body.appendChild(script);
  });
}

// ---------------------
// START GAME
// ---------------------
function startGame(gameNumber = 1, vocabList = null) {
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
    default: window.Game = Game1; break;
  }

  if (vocabList) {
    if (Array.isArray(vocabList) && vocabList.length >= 4) window.Game.vocab = vocabList;
    else console.warn("Vocabulario insuficiente, mínimo 4 palabras");
  }

  if (!window.Game.vocab || window.Game.vocab.length < 4) {
    alert("The game needs at least 4 words!");
    return;
  }

  startTimer();
  loadQuestion();
}

// ---------------------
// LOAD QUESTIONS
// ---------------------
function loadQuestion() {
  console.log("Cargando pregunta para jugador", currentPlayer);
  currentQuestion = window.Game.getQuestion();
  UI.renderQuestion(currentPlayer, currentQuestion.text, currentQuestion.options, onAnswer);
}

// ---------------------
// HANDLE ANSWER
// ---------------------
function onAnswer(selected) {
  console.log("Respuesta jugador", currentPlayer, ":", selected);

  const container = currentPlayer === 1 ? UI.options1 : UI.options2;
  Array.from(container.children).forEach(btn => btn.disabled = true);

  if (selected === currentQuestion.correct) {
    UI.playOk();
    setTimeout(() => switchPlayer(), 200);
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    setTimeout(() => loadQuestion(), 300);
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
    if (UI.getTime(currentPlayer) <= 0) endGame(currentPlayer === 1 ? 2 : 1);
  }, 1000);
}

// ---------------------
// END GAME
// ---------------------
function endGame(winner) {
  clearInterval(timerInterval);
  UI.showWinner(winner);
}
