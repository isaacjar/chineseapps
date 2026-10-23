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

  function setupToggleGroup(groupId, inputId, onChange) {
    const group = $(groupId);
    const input = $(inputId);
  
    group.querySelectorAll(".toggle-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.value === input.value);
  
      button.addEventListener("click", () => {
        input.value = button.dataset.value;
  
        group.querySelectorAll(".toggle-btn").forEach(option => {
          const active = option === button;
          option.classList.toggle("active", active);
          option.setAttribute("aria-pressed", String(active));
        });
  
        input.dispatchEvent(new Event("change", { bubbles: true }));
  
        if (onChange) onChange(input.value);
      });
  
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.value === input.value)
      );
    });
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

    setupToggleGroup("duration-options", "duration-select");

    setupToggleGroup("language-options", "language-select", () => {
      text = UI.setLanguage(getLang());
      if (catalog.length) {
        Setup.fillSelect($("dataset-select"), catalog, getLang());
      }
    });

    $("setup-form").addEventListener("submit", startFromSetup);
    $("ok-btn").addEventListener("click", submitAnswer);
    $("skip-btn").addEventListener("click", skipCharacter);
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
      const restartBtn = $("restart-btn");
      restartBtn.hidden = false;
      restartBtn.disabled = false;
      restartBtn.style.pointerEvents = "auto";
      restartBtn.style.opacity = "1";
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
    state.input = "";
    state.solved = new Set();
    state.sentenceNo++;
  
    // Seleccionar el primer carácter chino pendiente.
    state.selected = state.units.findIndex(
      unit => unit.isHan
    );
  
    if (state.selected === -1) {
      state.selected = null;
    }
  
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
      const okBtn = $("ok-btn");
      okBtn.classList.toggle("team-panda", state.active === "panda");
      okBtn.classList.toggle("team-dragon", state.active === "dragon");
    $("skip-btn").disabled =
      state.finished || state.selected === null;
    
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
    if (
      !state ||
      state.finished ||
      state.selected === null
    ) return;
  
    state.input = state.input.slice(0, -1);
    refresh();
  }

  function findNextUnsolved(fromIndex) {
    // Buscar primero hacia delante.
    for (let i = fromIndex + 1; i < state.units.length; i++) {
      if (state.units[i].isHan && !state.solved.has(i)) {
        return i;
      }
    }
  
    // Si no hay más, volver al principio.
    for (let i = 0; i <= fromIndex; i++) {
      if (state.units[i].isHan && !state.solved.has(i)) {
        return i;
      }
    }
  
    return null;
  }
  
  function skipCharacter() {
    if (
      !state ||
      state.finished ||
      state.selected === null
    ) return;
  
    const skippedIndex = state.selected;
  
    // Penalización para el equipo que decide saltar.
    state.scores[state.active] -= 5;
  
    // Marcar el carácter como resuelto para revelar su pinyin.
    state.solved.add(skippedIndex);
    state.input = "";
  
    UI.showFeedback(
      state.lang === "es" ? "Carácter saltado (-5)" : "Character skipped (-5)",
      "bad"
    );
  
    const totalCharacters = state.units.filter(
      unit => unit.isHan
    ).length;
  
    if (state.solved.size >= totalCharacters) {
      state.selected = null;
      refresh();
  
      setTimeout(async () => {
        if (!state || state.finished) return;
  
        await nextPhrase();
        refresh();
      }, 450);
  
      return;
    }
  
    // El equipo activo no cambia: continúa jugando.
    state.selected = findNextUnsolved(skippedIndex);
  
    refresh();
  }
  
  function submitAnswer() {
    if (
      !state ||
      state.finished ||
      state.selected === null ||
      !state.input
    ) return;
  
    const answeredIndex = state.selected;
    const unit = state.units[answeredIndex];
    const expected = Game.normalize(unit.pinyin);
    const given = Game.normalize(state.input);
    const isCorrect = expected && expected === given;
  
    if (isCorrect) {
      state.scores[state.active] += 20;
      state.solved.add(answeredIndex);
      UI.showFeedback(text.correct, "good");
    } else {
      state.scores[state.active] -= 10;
      UI.showFeedback(text.wrong, "bad");
    }
  
    state.input = "";
  
    // Cambiar de equipo después de cada respuesta.
    state.active = state.active === "panda" ? "dragon" : "panda";
  
    const totalCharacters = state.units.filter(
      unit => unit.isHan
    ).length;
  
    if (state.solved.size >= totalCharacters) {
      state.selected = null;
      refresh();
  
      setTimeout(async () => {
        if (!state || state.finished) return;
  
        await nextPhrase();
        refresh();
      }, 450);
  
      return;
    }
  
    if (isCorrect) {
      // Si acertó, buscar el siguiente carácter sin resolver,
      // empezando desde la posición siguiente.
      let nextIndex = null;
  
      for (let i = answeredIndex + 1; i < state.units.length; i++) {
        if (state.units[i].isHan && !state.solved.has(i)) {
          nextIndex = i;
          break;
        }
      }
  
      // Si no hay ninguno después, buscar desde el principio.
      if (nextIndex === null) {
        for (let i = 0; i < answeredIndex; i++) {
          if (state.units[i].isHan && !state.solved.has(i)) {
            nextIndex = i;
            break;
          }
        }
      }
  
      state.selected = nextIndex;
    } else {
      // Si falló, el siguiente equipo recibe el mismo carácter.
      state.selected = answeredIndex;
    }
  
    refresh();
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
          " " + text.wins;

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
