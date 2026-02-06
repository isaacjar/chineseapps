let currentPlayer = 1;
let timerInterval;

document.addEventListener("DOMContentLoaded", () => {
  Settings.load();
  UI.init();
  //Game1.init(); // por defecto
});

function startGame() {
  UI.setNames(Settings.data);
  UI.resetTimers(Settings.data.time);
  currentPlayer = 1;
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
