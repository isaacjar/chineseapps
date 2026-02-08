// app.js

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = null;
let selectedVocab = null;
let usedWords = new Set(); // Palabras ya usadas globalmente en el juego

// ---------------------
// DOMContentLoaded
// ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    Settings.load(); // Solo log de settings cargados
    UI.init();
    UI.setNames(Settings.data);

    await loadVocabList();

    // ---------------------
    // Parámetros URL y persistencia
    // ---------------------
    const urlParams = new URLSearchParams(window.location.search);
    const paramGame = Number(urlParams.get("game"));
    const paramVocab = urlParams.get("vocab");
    const paramP1 = urlParams.get("p1");
    const paramP2 = urlParams.get("p2");

    const lastGame = paramGame || Number(localStorage.getItem("lastGame"));
    const lastVocab = paramVocab || localStorage.getItem("lastVocab"));

    // ---------------------
    // Setear valores en popup
    // ---------------------
    if (lastGame) {
      currentGame = lastGame;
      UI.setActiveGameBtn(currentGame);
    }

    if (lastVocab && UI.vocabSelect) {
      UI.vocabSelect.value = lastVocab;
      selectedVocab = await loadVocabFile(lastVocab);
    }

    const p1 = paramP1 || localStorage.getItem("lastPlayer1") || "Player 1";
    const p2 = paramP2 || localStorage.getItem("lastPlayer2") || "Player 2";
    UI.player1Input.value = p1;
    UI.player2Input.value = p2;
    UI.setNames({ jugador1: p1, jugador2: p2 });

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

      selectedVocab = await loadVocabFile(vocabKey);

      UI.setNames({ jugador1: p1, jugador2: p2 });

      localStorage.setItem("lastGame", currentGame);
      localStorage.setItem("lastVocab", vocabKey);
      localStorage.setItem("lastPlayer1", p1);
      localStorage.setItem("lastPlayer2", p2);

      usedWords.clear();
      startGame(currentGame, selectedVocab);
    };

    // ---------------------
    // Mostrar popup o lanzar juego
    // ---------------------
    if (paramGame || paramVocab || paramP1 || paramP2) {
      usedWords.clear();
      startGame(currentGame, selectedVocab);
    } else {
      UI.showMenu();
    }

  } catch (e) {
    alert("Failed to load vocabulary. Please check your internet connection.");
  }
});

// ---------------------
// Cargar index.js (voclists)
// ---------------------
async function loadVocabList(retries = 5, delay = 500) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";
    script.async = true;

    script.onload = async () => {
      let attempt = 0;

      const waitForVoclists = () => new Promise((res, rej) => {
        const check = () => {
          if (window.voclists && UI.vocabSelect) {
            // Llenar el select
            UI.vocabSelect.innerHTML = "";
            window.voclists.forEach(v => {
              const opt = document.createElement("option");
              opt.value = v.filename;
              opt.textContent = v.title;
              UI.vocabSelect.appendChild(opt);
            });
            res();
          } else {
            attempt++;
            if (attempt > retries) {
              rej("voclists not found after multiple attempts");
            } else {
              setTimeout(check, delay);
            }
          }
        };
        check();
      });

      try {
        await waitForVoclists();
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    script.onerror = () => reject("Failed to load index.js");
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

  const options = generateOptions(currentQuestion);

  UI.renderQuestion(
    currentPlayer,
    currentQuestion.hanzi,
    options,
    onAnswer
  );
}

// ---------------------
// Generar opciones
// ---------------------
function generateOptions(word) {
  const wordLength = word.hanzi.length;

  // Reiniciar usedWords si todas las palabras se han usado
  if (usedWords.size >= window.Game.vocab.length) {
    usedWords.clear();
  }

  usedWords.add(word.hanzi);

  // Filtrar candidatos de la misma longitud y no usados
  let candidates = window.Game.vocab
    .filter(w => w.hanzi.length === wordLength && w.hanzi !== word.hanzi && !usedWords.has(w.hanzi))
    .map(w => w.hanzi);

  shuffleArray(candidates);

  const opts = [word.hanzi];

  // Añadir hasta 3 opciones
  for (let i = 0; i < 3 && i < candidates.length; i++) opts.push(candidates[i]);

  // Rellenar con otras palabras si no hay suficientes
  if (opts.length < 4) {
    const remaining = window.Game.vocab
      .map(w => w.hanzi)
      .filter(h => !opts.includes(h));

    shuffleArray(remaining);
    for (let i = 0; opts.length < 4 && i < remaining.length; i++) opts.push(remaining[i]);
  }

  return shuffleArray(opts);
}

// ---------------------
// Mezclar array
// ---------------------
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------------------
// HANDLE ANSWER
// ---------------------
function onAnswer(selected) {
  const container = currentPlayer === 1 ? UI.options1 : UI.options2;
  [...container.children].forEach(btn => btn.disabled = true);

  if (selected === currentQuestion.hanzi) {
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
