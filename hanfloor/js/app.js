console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = 1; // juego seleccionado, por defecto 1
let selectedVocab = null;

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();
  UI.setNames(Settings.data);

  // Cargar vocabulario remoto
  await loadVocabList();

  const urlParams = new URLSearchParams(window.location.search);
  const gameParam = urlParams.get("game");
  const vocabParam = urlParams.get("vocab");

  if (gameParam) {
    currentGame = Number(gameParam);
    startGame(currentGame, vocabParam);
  } else {
    // mostrar popup de selección de juego
    UI.showMenu();
  }

  // START button arranca el juego con la selección actual
  const btnStart = document.getElementById("btnStartGame");
  if (btnStart) btnStart.onclick = () => {
    // Guardar nombres
    const p1 = UI.player1Input.value.trim() || "Player 1";
    const p2 = UI.player2Input.value.trim() || "Player 2";
    UI.setNames({ jugador1: p1, jugador2: p2 });

    // Guardar vocabulario seleccionado
    const sel = UI.vocabSelect.value;
    selectedVocab = sel ? window.Voc[sel] : null;

    UI.hideMenu();
    startGame(currentGame, selectedVocab);
  };

  // Botones de selección de juego
  UI.gameTypeBtns.forEach(btn => {
    btn.onclick = () => {
      currentGame = Number(btn.dataset.game);
      UI.gameTypeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });
});

// ======================
// Cargar vocabulario remoto
// ======================
async function loadVocabList() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";
    script.onload = () => {
      if (window.Voc && UI.vocabSelect) {
        UI.vocabSelect.innerHTML = "";
        for (const key in window.Voc) {
          const opt = document.createElement("option");
          opt.value = key;
          opt.textContent = key;
          UI.vocabSelect.appendChild(opt);
        }
        resolve();
      } else reject("No se cargó 'Voc'");
    };
    script.onerror = () => reject("Error cargando script remoto");
    document.body.appendChild(script);
  });
};

// ======================
// START GAME
// ======================
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
    alert("El juego necesita al menos 4 palabras para funcionar");
    return;
  }

  startTimer();
  loadQuestion();
}

// ======================
// LOAD QUESTIONS
// ======================
function loadQuestion() {
  console.log("Cargando pregunta para jugador", currentPlayer);
  currentQuestion = window.Game.getQuestion();
  UI.renderQuestion(currentPlayer, currentQuestion.text, currentQuestion.options, onAnswer);
}

// ======================
// HANDLE ANSWER
// ======================
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

// ======================
// SWITCH PLAYER
// ======================
function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  UI.setActive(currentPlayer);
  loadQuestion();
}

// ======================
// TIMER
// ======================
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    UI.decreaseTime(currentPlayer);
    if (UI.getTime(currentPlayer) <= 0) endGame(currentPlayer === 1 ? 2 : 1);
  }, 1000);
}

// ======================
// END GAME
// ======================
function endGame(winner) {
  clearInterval(timerInterval);
  UI.showWinner(winner);
}
