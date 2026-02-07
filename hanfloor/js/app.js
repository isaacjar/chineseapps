// app.js
console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();

  // mostrar nombres según settings
  UI.setNames(Settings.data);
});

/* ======================
   START GAME
====================== */
function startGame() {
  console.log("START GAME");

  UI.resetTimers(Settings.data.time);

  currentPlayer = 1;
  UI.setActive(currentPlayer);

  startTimer();
  loadQuestion();
}

/* ======================
   LOAD QUESTIONS
====================== */
function loadQuestion() {
  console.log("Cargando pregunta para jugador", currentPlayer);

  currentQuestion = Game1.getQuestion();

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

  // Desactivar botones mientras procesamos
  const container = currentPlayer === 1 ? UI.options1 : UI.options2;
  Array.from(container.children).forEach(btn => btn.disabled = true);

  if (selected === currentQuestion.correct) {
    UI.playOk();
    // mini-retardo antes de cambiar de jugador
    setTimeout(() => switchPlayer(), 200);
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    // mini-retardo antes de recargar pregunta para mismo jugador
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

    if (UI.getTime(currentPlayer) <= 0) {
      endGame(currentPlayer === 1 ? 2 : 1);
    }
  }, 1000);
}

/* ======================
   END GAME
====================== */
function endGame(winner) {
  clearInterval(timerInterval);
  UI.showWinner(winner);
}
