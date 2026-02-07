// app.js
console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();
});

/* ======================
   START GAME
====================== */

function startGame() {
  console.log("START GAME");

  UI.setNames(Settings.data);
  UI.resetTimers(Settings.data.time);

  currentPlayer = 1;
  UI.setActive(currentPlayer);

  startTimer();
  loadQuestion();
}

/* ======================
   QUESTIONS
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

function onAnswer(selected) {
  console.log("Respuesta jugador", currentPlayer, ":", selected);

  if (selected === currentQuestion.correct) {
    UI.playOk();
    switchPlayer();
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    loadQuestion(); // sigue el mismo jugador
  }
}

/* ======================
   PLAYER SWITCH
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
