// app.js
console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = 1; // juego seleccionado, por defecto 1

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();
  UI.setNames(Settings.data);

  const urlParams = new URLSearchParams(window.location.search);
  const gameParam = urlParams.get("game");
  const vocabParam = urlParams.get("vocab"); // opcional: lista de vocabulario

  if (gameParam) {
    currentGame = Number(gameParam);
    startGame(currentGame, vocabParam);
  } else {
    // mostrar popup de selección de juego
    showMenu();
  }

  // START button arranca el juego con la selección actual
  const btnStart = document.getElementById("btnStart");
  if (btnStart) btnStart.onclick = () => startGame(currentGame);
});

/* ======================
   MENÚ INICIAL
====================== */
function showMenu() {
  UI.showMenu("Selecciona un juego", [
    "Elige el pinyin",
    "Elige el significado",
    "Elige la palabra",
    "Elige la imagen"
  ], (gameNumber, label) => {
    currentGame = gameNumber;       // guardamos elección
    UI.hideMenu();                  // ocultamos popup
    console.log("Juego seleccionado:", gameNumber, label);
    // ¡No arrancamos aún! Esperamos botón START
  });
}

/* ======================
   START GAME
====================== */
function startGame(gameNumber = 1, vocabList = null) {
  console.log("START GAME", gameNumber);

  currentPlayer = 1;
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  // Seleccionar juego correspondiente
  switch (gameNumber) {
    case 1: window.Game = Game1; break;
    case 2: window.Game = Game2; break;
    case 3: window.Game = Game3; break;
    case 4: window.Game = Game4; break;
    default: window.Game = Game1; break;
  }

  // Sobrescribir vocabulario si se pasa por URL
  if (vocabList) {
    try {
      const parsed = JSON.parse(decodeURIComponent(vocabList));
      if (Array.isArray(parsed) && parsed.length >= 4) window.Game.vocab = parsed;
      else console.warn("Vocabulario insuficiente, mínimo 4 palabras");
    } catch (e) {
      console.error("Error parseando vocabulario URL", e);
    }
  }

  // Comprobar mínimo 4 palabras
  if (!window.Game.vocab || window.Game.vocab.length < 4) {
    alert("El juego necesita al menos 4 palabras para funcionar");
    return;
  }

  startTimer();
  loadQuestion();
}

/* ======================
   LOAD QUESTIONS
====================== */
function loadQuestion() {
  console.log("Cargando pregunta para jugador", currentPlayer);

  currentQuestion = window.Game.getQuestion();

  UI.renderQuestion(
    currentPlayer,
    currentQuestion.text,
    currentQuestion.options,
    onAnswer
  );
}

/* ======================
   HANDLE ANSWER
====================== */
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

/* ======================
   SWITCH PLAYER
====================== */
function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  UI.setActive(currentPlayer);
  loadQuestion();
}

/* ======================
   TIMER
====================== */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    UI.decreaseTime(currentPlayer);
    if (UI.getTime(currentPlayer) <= 0) endGame(currentPlayer === 1 ? 2 : 1);
  }, 1000);
}

/* ======================
   END GAME
====================== */
function endGame(winner) {
  clearInterval(timerInterval);
  UI.showWinner(winner);
}
