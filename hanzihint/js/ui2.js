(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  function setLanguage(lang) {
    const text = window.HanziClashSetup.TEXT[lang] || window.HanziClashSetup.TEXT.en;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (text[key]) el.textContent = text[key];
    });
    $("subtitle").textContent = text.subtitle;
    return text;
  }
  function renderSentence(units, state) {
    const root = $("sentence"); root.replaceChildren();
    units.forEach((unit, idx) => {
      if (!unit.isHan && !unit.punctuation) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "char-tile" + (unit.punctuation ? " punctuation" : "");
      button.dataset.index = String(idx);
      button.disabled = state.finished || !unit.isHan || state.solved.has(idx);
      if (unit.isHan) {
        const char = document.createElement("span"); char.textContent = unit.char; button.appendChild(char);
        const pin = document.createElement("span"); pin.className = "tile-pin";
        pin.textContent = state.solved.has(idx) ? (unit.pinyin || "") : (state.selected === idx ? (state.input || "…") : "");
        button.appendChild(pin);
      } else button.textContent = unit.char;
      if (state.selected === idx) button.classList.add("selected");
      if (state.solved.has(idx)) button.classList.add("done");
      button.addEventListener("click", () => state.onSelect(idx));
      root.appendChild(button);
    });
    $("progress-label").textContent = `${state.solved.size}/${units.filter(u=>u.isHan).length}`;
    $("selected-char").textContent = state.selected === null ? "?" : units[state.selected].char;
    $("answer-preview").textContent = state.input || "";
    $("instruction").textContent = state.text[state.selected === null ? "selectChar" : "typePinyin"];
  }
  function renderKeyboard(onLetter, onBackspace, disabled) {
    const root = $("keyboard"); root.replaceChildren();
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
      const button = document.createElement("button"); button.type = "button"; button.className = "key"; button.textContent = letter;
      button.disabled = disabled; button.addEventListener("click", () => onLetter(letter.toLowerCase())); root.appendChild(button);
    });
    const back = document.createElement("button"); back.type = "button"; back.className = "key special backspace-key"; back.setAttribute("aria-label", "Backspace"); back.title = "Backspace"; back.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4H21V20H9L2 12L9 4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 9L18 15M18 9L13 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`; back.disabled = disabled; back.addEventListener("click", onBackspace); root.appendChild(back);
  }
  function renderScore(state) {
    $("panda-label").textContent = state.names.panda; $("dragon-label").textContent = state.names.dragon;
    $("panda-score").textContent = state.scores.panda; $("dragon-score").textContent = state.scores.dragon;
    $("panda-time").textContent = state.times.panda; $("dragon-time").textContent = state.times.dragon;
    $("panda-panel").classList.toggle("active", state.active === "panda" && !state.finished);
    $("dragon-panel").classList.toggle("active", state.active === "dragon" && !state.finished);
    $("turn-banner").className = "turn-banner " + (state.active === "panda" ? "panda-turn" : "dragon-turn");
    $("turn-banner").textContent = (state.active === "panda" ? "🐼 " : "🐉 ") + state.names[state.active] + state.text.turn;
    $("app").classList.toggle("panda-theme", state.active === "panda");
    $("app").classList.toggle("dragon-theme", state.active === "dragon");
  }
  function showFeedback(message, kind="") { const el=$("feedback"); el.textContent=message; el.className="feedback "+kind; }
  function showScreen(screen) {
    $("setup-screen").hidden = screen !== "setup";
    $("game-screen").hidden = screen !== "game";
    $("result-screen").hidden = screen !== "result";
    $("restart-btn").hidden = screen === "setup";
  }
  window.HanziClashUI = { $, setLanguage, renderSentence, renderKeyboard, renderScore, showFeedback, showScreen };
})();
