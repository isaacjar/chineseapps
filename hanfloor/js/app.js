// app.js

let currentPlayer = 1;
let timerInterval = null;
let currentQuestion = null;
let currentGame = null;
let selectedVocab = null;
let usedWords = new Set();

// ---------------------
// DOMContentLoaded
// ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    Settings.load();
    UI.init();

    await loadVocabList();

    const urlParams = new URLSearchParams(window.location.search);
    const paramGame = Number(urlParams.get("game"));
    const paramVocab = urlParams.get("vocab");
    const paramP1 = urlParams.get("p1");
    const paramP2 = urlParams.get("p2");

    const lastGame = paramGame || Number(localStorage.getItem("lastGame"));
    let lastVocab = paramVocab || localStorage.getItem("lastVocab");

    // ---------------------
    // Time buttons
    // ---------------------
    if (UI.timeBtns) {
      UI.timeBtns.forEach(btn => {
        btn.onclick = () => {
          const t = Number(btn.dataset.time);
          Settings.data.time = t;
          Settings.save();
          UI.setActiveTimeBtn(t);
        };
      });
      UI.setActiveTimeBtn(Settings.data.time);
    }

    // ---------------------
    // Vocab select
    // ---------------------
    if (UI.vocabSelect && UI.vocabSelect.options.length > 0) {
      const exists = Array.from(UI.vocabSelect.options)
        .some(opt => opt.value === lastVocab);

      if (!exists) {
        lastVocab = UI.vocabSelect.options[0].value;
      }

      UI.vocabSelect.value = lastVocab;
      selectedVocab = await loadVocabFile(lastVocab);
      localStorage.setItem("lastVocab", lastVocab);
    }

    // ---------------------
    // Game type
    // ---------------------
    if (lastGame) {
      currentGame = lastGame;
      UI.setActiveGameBtn(currentGame);
    }

    // ---------------------
    // Player names
    // ---------------------
    const p1 = paramP1 || localStorage.getItem("lastPlayer1") || "Player 1";
    const p2 = paramP2 || localStorage.getItem("lastPlayer2") || "Player 2";

    UI.player1Input.value = p1;
    UI.player2Input.value = p2;
    UI.setNames({ jugador1: p1, jugador2: p2 });

    UI.gameTypeBtns.forEach(btn => {
      btn.onclick = () => {
        currentGame = Number(btn.dataset.game);
        UI.setActiveGameBtn(currentGame);
      };
    });

    // ---------------------
    // START
    // ---------------------
    UI.btnStartGame.onclick = async () => {
      if (!currentGame) return alert("Please select a game type");

      const vocabKey = UI.vocabSelect.value;
      if (!vocabKey) return alert("Please select a vocabulary list");

      const p1 = UI.player1Input.value.trim() || "Player 1";
      const p2 = UI.player2Input.value.trim() || "Player 2";

      localStorage.setItem("lastPlayer1", p1);
      localStorage.setItem("lastPlayer2", p2);

      UI.setNames({ jugador1: p1, jugador2: p2 });

      selectedVocab = await loadVocabFile(vocabKey);

      localStorage.setItem("lastGame", currentGame);
      localStorage.setItem("lastVocab", vocabKey);

      usedWords.clear();
      startGame(currentGame, selectedVocab);
    };

    if (paramGame || paramVocab) {
      usedWords.clear();
      startGame(currentGame, selectedVocab);
    } else {
      UI.showMenu();
    }

  } catch (e) {
    console.error(e);
    alert("Failed to load vocabulary");
  }
});

// ---------------------
// Load vocab index
// ---------------------
async function loadVocabList(retries = 10, delay = 300) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/hanfloor/voc/index.js";
    script.async = true;

    script.onload = () => {
      let attempt = 0;
      const check = () => {
        if (Array.isArray(window.voclists)) {
          UI.vocabSelect.innerHTML = "";
          voclists.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.filename;
            opt.textContent = v.title;
            UI.vocabSelect.appendChild(opt);
          });
          resolve();
          return;
        }
        attempt++;
        attempt >= retries ? reject() : setTimeout(check, delay);
      };
      check();
    };

    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// ---------------------
// Load vocab JSON
// ---------------------
async function loadVocabFile(filename) {
  const res = await fetch(
    `https://isaacjar.github.io/chineseapps/hanfloor/voc/${filename}full.json`
  );
  const data = await res.json();
  return normalizeVocab(data);
}

// ---------------------
// Normalize
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
function startGame(gameNumber, vocabList) {
  UI.hideMenu();
  currentPlayer = 1;
  UI.resetTimers(Settings.data.time);
  UI.setActive(currentPlayer);

  window.Game =
    gameNumber === 1 ? Game1 :
    gameNumber === 2 ? Game2 :
    gameNumber === 3 ? Game3 : Game4;

  window.Game.vocab = vocabList;

  startTimer();
  loadQuestion();
}

// ---------------------
// LOAD QUESTION
// ---------------------
function loadQuestion() {
  currentQuestion = window.Game.getQuestion();

  if (!currentQuestion) {
    usedWords.clear();
    currentQuestion = window.Game.getQuestion();
  }

  if (!currentQuestion) return;

  let options, correct;

  if (window.Game.mode === "hanzi-to-pinyin") {
    options = generatePinyinOptions(currentQuestion);
    correct = currentQuestion.pinyin;
  } else {
    options = generateHanziOptions(currentQuestion);
    correct = currentQuestion.hanzi;
  }

  UI.renderQuestion(
    currentPlayer,
    currentQuestion.hanzi,
    options,
    sel => onAnswer(sel, correct)
  );

  const inactive = currentPlayer === 1 ? UI.options2 : UI.options1;
  [...inactive.children].forEach(b => b.disabled = true);

  const active = currentPlayer === 1 ? UI.options1 : UI.options2;
  [...active.children].forEach(b => b.disabled = false);
}

// ---------------------
// Options helpers
// ---------------------
function generateHanziOptions(word) {
  usedWords.add(word.hanzi);

  let candidates = window.Game.vocab
    .filter(w => w.hanzi !== word.hanzi)
    .map(w => w.hanzi);

  shuffleArray(candidates);
  return shuffleArray([word.hanzi, ...candidates.slice(0, 3)]);
}

function generatePinyinOptions(word) {
  let candidates = window.Game.vocab
    .filter(w => w.hanzi !== word.hanzi)
    .map(w => w.pinyin);

  shuffleArray(candidates);
  return shuffleArray([word.pinyin, ...candidates.slice(0, 3)]);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ---------------------
// Answer
// ---------------------
function onAnswer(selected, correct) {
  const active = currentPlayer === 1 ? UI.options1 : UI.options2;

  [...active.children].forEach(btn => btn.disabled = true);

  [...active.children].forEach(btn => {
    if (btn.textContent === correct) btn.classList.add("correct");
    else if (btn.textContent === selected) btn.classList.add("incorrect");
  });

  if (selected.trim().toLowerCase() === correct.trim().toLowerCase()) {
    UI.playOk();
    setTimeout(switchPlayer, 500);
  } else {
    UI.playFail();
    UI.penalize(currentPlayer, Settings.data.penalty);
    UI.markFail(currentPlayer, 800);
    setTimeout(loadQuestion, 800);
  }
}

// ---------------------
// Timer / end
// ---------------------
function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  UI.setActive(currentPlayer);
  loadQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    UI.decreaseTime(currentPlayer);
    if (UI.getTime(currentPlayer) <= 0) {
      endGame(currentPlayer === 1 ? 2 : 1);
    }
  }, 1000);
}

function endGame(winner) {
  clearInterval(timerInterval);
  launchConfetti();
  UI.showWinPopup({
    name: winner === 1 ? UI.name1.textContent : UI.name2.textContent,
    points: UI.getTime(winner) * 10
  });
}
