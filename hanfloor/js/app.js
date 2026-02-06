// app.js
console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();
});

function startGame() {
  console.log("START GAME");

  UI.setNames(Settings.data);
  UI.resetTimers(Settings.data.time);

  currentPlayer = 1;
  UI.setActive(currentPlayer);

  Game1.start();
  tick();
}

function tick() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    UI.decreaseTime(currentPlayer);
    if (UI.getTime(currentPlayer) <= 0) {
      endGame(currentPlayer === 1 ? 2 : 1);
    }
  }, 1000);
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  UI.setActive(currentPlayer);
  tick();
}

function endGame(winner) {
  clearInterval(timerInterval);
  UI.showWinner(winner);
}
