console.log("app.js cargado");

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;

// Detectar parámetros URL
const urlParams = new URLSearchParams(window.location.search);
const selectedGame = urlParams.get("game"); // número de juego opcional
const vocabParam = urlParams.get("vocab"); // lista de vocabulario opcional

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");
  Settings.load();
  UI.init();

  // mostrar nombres según settings
  UI.setNames(Settings.data);

  if (selectedGame) {
    // Si viene parámetro ?game=, arrancamos directo
    startGame();
  } else {
    // mostrar menú de selección
    showMenu();
  }
});

/* ======================
   MENÚ DE SELECCIÓN
====================== */
function showMenu() {
  const popup = document.getElementById("popupContainer");
  popup.classList.remove("hidden");
  popup.innerHTML = `
    <div class="menu-overlay">
      <div class="menu-box">
        <h2>Selecciona un juego</h2>
        <div class="menu-options">
          <button class="menu-btn" onclick="startGame(1)">1 - Elige el pinyin</button>
          <button class="menu-btn" onclick="startGame(2)">2 - Elige el significado</button>
          <button class="menu-btn" onclick="startGame(3)">3 - Elige la palabra</button>
          <button class="menu-btn" onclick="startGame(4)">4 - Elige la imagen</button>
        </div>
      </div>
    </div>
  `;
}

/* ======================
   START GAME
   gameNumber opcional desde menú
====================== */
function startGame(gameNumber) {
  console.log("START GAME", gameNumber || selectedGame);

  // ocultar popup si estaba abierto
  const popup = document.getElementById("popupContainer");
  popup.classList.add("hidden");
  popup.innerHTML = "";

  UI.resetTimers(Settings.data.time);
  currentPlayer = 1;
  UI.setActive(currentPlayer);

  // Cargar vocab si viene por URL
  if (vocabParam) {
    try {
      const vocabList = JSON.parse(decodeURIComponent(vocabParam));
      if (vocabList.length >= 4) Game1.vocab = vocabList;
    } catch (e) {
      console.warn("Error parseando vocab de URL", e);
    }
  }

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
