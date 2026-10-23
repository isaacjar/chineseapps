// app2.js
(() => {
  "use strict";

  const UI = window.HanziClashUI;
  const Game = window.HanziClashGame;
  const Setup = window.HanziClashSetup;
  const $ = UI.$;

  let catalog = [];
  let state = null;
  let intervalId = null;
  let currentPhrase = null;
  let phrasePool = [];
  let lastPhrase = null;
  let text = Setup.TEXT.en;

  const stopTimer = () => {
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = null;
  };

  function getLang() {
    return $("language-select").value || "en";
  }

  function openSetup() {
    stopTimer();
    UI.showScreen("setup");
  }

  function requestNewGame() {
    if (state && !state.finished && !$("game-screen").hidden) {
      const message = state.lang === "es"
        ? "¿Deseas finalizar la partida actual e iniciar una nueva?"
        : "Do you want to end the current game and start a new one?";

      if (!window.confirm(message)) return;

      state.finished = true;
      stopTimer();
    }

    openSetup();
  }

  async function init() {
    UI.showScreen("setup");

    const select = $("dataset-select");

    try {
      catalog = await Setup.loadCatalog();
      Setup.fillSelect(select, catalog, getLang());
    } catch (_) {
      select.innerHTML =
        `<option value="">${Setup.TEXT.en.loadError}</option>`;
    }

    $("language-select").addEventListener("change", () => {
      text = UI.setLanguage(getLang());

      if (catalog.length) {
        Setup.fillSelect(select, catalog, getLang());
      }
    });

    $("setup-form").addEventListener("submit", startFromSetup);
    $("ok-btn").addEventListener("click", submitAnswer);

    $("clear-btn").addEventListener("click", () => {
      if (!state || state.finished) return;
      state.input = "";
      refresh();
    });

    $("restart-btn").addEventListener("click", requestNewGame);
    $("play-again-btn").addEventListener("click", openSetup);

    document.addEventListener("keydown", onKeydown);

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw2.js").catch(() => {});
    }

    text = UI.setLanguage("en");
  }

  async function startFromSetup(event) {
    event.preventDefault();

    const error = $("setup-error");
    error.textContent = "";

    const panda = $("panda-name").value.trim().slice(0, 11);
    const dragon = $("dragon-name").value.trim().slice(0, 11);

    if (!panda || !dragon) {
      error.textContent = getLang() === "es"
        ? "Los dos equipos necesitan un nombre."
        : "Both teams need a name.";
      return;
    }

    if (!catalog.length) {
      error.textContent = text.loadError;
      return;
    }

    const item = catalog[Number($("dataset-select").value)];

    if (!item) {
      error.textContent = text.choose;
      return;
    }

    const submit = $("setup-form").querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = text.loading;

    try {
      phrasePool = await Setup.fetchDataset(item);

      if (
        !phrasePool.some(phrase =>
          Array.from(String(phrase.ch || "")).some(Game.isHan)
        )
      ) {
        throw new Error("No usable Chinese sentences in data file.");
      }

      currentPhrase = null;
      lastPhrase = null;

      const duration = Number($("duration-select").value) || 60;

      state = {
        names: { panda, dragon },
        scores: { panda: 0, dragon: 0 },
        times: { panda: duration, dragon: duration },
        active: Math.random() < 0.5 ? "panda" : "dragon",
        duration,
        lang: getLang(),
        text: Setup.TEXT[getLang()],
        units: [],
        selected: null,
        input: "",
        solved: new Set(),
        finished: false,
        sentenceNo: 0,
        bonus: 0
      };

      text = state.text;

      $("panda-label").textContent = panda;
      $("dragon-label").textContent = dragon;

      UI.showScreen("game");
      await nextPhrase();
      refresh();
      startTimer();
    } catch (err) {
      error.textContent =
        text.loadError +
        (err && err.message ? " (" + err.message + ")" : "");
    } finally {
      submit.disabled = false;
      submit.textContent = text.start;
    }
  }

  function startTimer() {
    stopTimer();

    intervalId = setInterval(() => {
      if (!state || state.finished) return;

      const team = state.active;
      state.times[team] = Math.max(0, state.times[team] - 1);

      UI.renderScore(state);

      if (state.times[team] <= 0) {
        finishGame(team);
      }
    }, 1000);
  }

  async function nextPhrase() {
    currentPhrase = Game.choosePhrase(phrasePool, lastPhrase);
    lastPhrase = currentPhrase;

    state.units = Game.getUnits(currentPhrase);
    state.selected = null;
    state.input = "";
    state.solved = new Set();
    state.sentenceNo++;

    $("sentence-count").textContent =
      (state.lang === "es" ? "Frase " : "Sentence ") + state.sentenceNo;

    $("progress-label").textContent = "";
    UI.showFeedback("");
  }

  function refresh() {
    if (!state) return;

    UI.renderScore(state);

    UI.renderSentence(state.units, {
      solved: state.solved,
      selected: state.selected,
      input: state.input,
      text: state.text,
      finished: state.finished,
      onSelect: selectCharacter
    });

    UI.renderKeyboard(
      addLetter,
      backspace,
      state.finished || state.selected === null
    );

    $("ok-btn").disabled =
      state.finished || state.selected === null || !state.input.length;

    $("clear-btn").disabled =
      state.finished || state.selected === null;
  }

  function selectCharacter(index) {
    if (
      !state ||
      state.finished ||
      !state.units[index] ||
      !state.units[index].isHan ||
      state.solved.has(index)
    ) return;

    state.selected = index;
    state.input = "";

    UI.showFeedback("");
    refresh();
  }
  
  function addLetter(letter) {
    if (
      !state ||
      state.finished ||
      state.selected === null ||
      state.input.length >= 6
    ) return;
  
    state.input += letter;
    refresh();
  }

  function backspace() {
    if (!state || state.finished) return;

    state.input = state.input.slice(0, -1);
    refresh();
  }

  function submitAnswer() {
    if (
      !state ||
      state.finished ||
      state.selected === null ||
      !state.input
    ) return;

    const unit = state.units[state.selected];
    const expected = Game.normalize(unit.pinyin);
    const given = Game.normalize(state.input);

    if (expected && expected === given) {
      state.scores[state.active] += 20;
      state.solved.add(state.selected);
      UI.showFeedback(text.correct, "good");
    } else {
      state.scores[state.active] -= 10;

      UI.showFeedback(
        text.wrong + (unit.pinyin ? ` (${unit.pinyin})` : ""),
        "bad"
      );
    }

    state.selected = null;
    state.input = "";

    state.active = state.active === "panda" ? "dragon" : "panda";

    const hanziUnits = state.units.filter(unit => unit.isHan);

    if (state.solved.size >= hanziUnits.length) {
      setTimeout(async () => {
        if (!state || state.finished) return;

        await nextPhrase();
        refresh();
      }, 450);
    } else {
      refresh();
    }
  }

  function onKeydown(event) {
    if (!state || state.finished || $("game-screen").hidden) return;

    if (/^[a-zA-Z]$/.test(event.key) && state.selected !== null) {
      addLetter(event.key.toLowerCase());
      event.preventDefault();
    } else if (event.key === "Backspace") {
      backspace();
      event.preventDefault();
    } else if (event.key === "Enter") {
      submitAnswer();
      event.preventDefault();
    }
  }

  function finishGame(reason) {
    if (!state || state.finished) return;

    stopTimer();
    state.finished = true;

    const endedTeam =
      reason === "panda" || reason === "dragon" ? reason : null;

    if (endedTeam) {
      const rival = endedTeam === "panda" ? "dragon" : "panda";

      state.bonus = state.times[rival];
      state.scores[rival] += state.bonus;
    }

    const pandaScore = state.scores.panda;
    const dragonScore = state.scores.dragon;

    $("winner-title").textContent =
      pandaScore === dragonScore
        ? text.draw
        : state.names[pandaScore > dragonScore ? "panda" : "dragon"] +
          text.wins;

    $("winner-detail").textContent = endedTeam
      ? `${text.timeBonus} ${
          state.names[endedTeam === "panda" ? "dragon" : "panda"]
        }: +${state.bonus} ${text.seconds}.`
      : text.finished;

    $("final-panda-name").textContent = state.names.panda;
    $("final-dragon-name").textContent = state.names.dragon;
    $("final-panda-score").textContent = pandaScore;
    $("final-dragon-score").textContent = dragonScore;

    UI.showScreen("result");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
