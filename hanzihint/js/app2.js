(() => {
  "use strict";
  const UI = window.HanziClashUI, Game = window.HanziClashGame, Setup = window.HanziClashSetup, $ = UI.$;
  let catalog = [], state = null, intervalId = null, currentPhrase = null, phrasePool = [], lastPhrase = null;
  let text = Setup.TEXT.en;
  const stopTimer = () => { if (intervalId !== null) clearInterval(intervalId); intervalId = null; };
  function getLang() { return $("language-select").value || "en"; }
  async function init() {
    UI.showScreen("setup");
    const select = $("dataset-select");
    try { catalog = await Setup.loadCatalog(); Setup.fillSelect(select, catalog, getLang()); }
    catch (_) { select.innerHTML = `<option value="">${Setup.TEXT.en.loadError}</option>`; }
    $("language-select").addEventListener("change", () => {
      text = UI.setLanguage(getLang());
      if (catalog.length) Setup.fillSelect(select, catalog, getLang());
    });
    $("setup-form").addEventListener("submit", startFromSetup);
    $("ok-btn").addEventListener("click", submitAnswer);
    $("clear-btn").addEventListener("click", () => { if (!state || state.finished) return; state.input=""; refresh(); });
    $("skip-btn").addEventListener("click", skipCharacter);
    $("end-btn").addEventListener("click", () => finishGame("manual"));
    $("restart-btn").addEventListener("click", () => { stopTimer(); UI.showScreen("setup"); });
    $("play-again-btn").addEventListener("click", () => { stopTimer(); UI.showScreen("setup"); });
    document.addEventListener("keydown", onKeydown);
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw2.js").catch(()=>{});
    text = UI.setLanguage("en");
  }
  async function startFromSetup(event) {
    event.preventDefault();
    const error = $("setup-error"); error.textContent = "";
    const panda = $("panda-name").value.trim().slice(0,11), dragon = $("dragon-name").value.trim().slice(0,11);
    if (!panda || !dragon) { error.textContent = getLang()==="es" ? "Los dos equipos necesitan un nombre." : "Both teams need a name."; return; }
    if (!catalog.length) { error.textContent = text.loadError; return; }
    const item = catalog[Number($("dataset-select").value)];
    if (!item) { error.textContent = text.choose; return; }
    const submit = $("setup-form").querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = text.loading;
    try {
      phrasePool = await Setup.fetchDataset(item);
      if (!phrasePool.some(p => Array.from(String(p.ch||"")).some(Game.isHan))) throw new Error("No usable Chinese sentences in data file.");
      currentPhrase = null; lastPhrase = null;
      const duration = Number($("duration-select").value) || 60;
      state = {
        names:{panda,dragon}, scores:{panda:0,dragon:0}, times:{panda:duration,dragon:duration},
        active:Math.random()<0.5 ? "panda" : "dragon", duration, lang:getLang(), text:Setup.TEXT[getLang()],
        units:[], selected:null, input:"", solved:new Set(), finished:false, sentenceNo:0, bonus:0
      };
      text = state.text;
      $("panda-label").textContent=panda; $("dragon-label").textContent=dragon;
      UI.showScreen("game"); await nextPhrase(); refresh(); startTimer();
    } catch (err) {
      error.textContent = text.loadError + (err && err.message ? " ("+err.message+")" : "");
    } finally {
      submit.disabled = false; submit.textContent = text.start;
    }
  }
  function startTimer() {
    stopTimer();
    intervalId = setInterval(() => {
      if (!state || state.finished) return;
      const team = state.active;
      state.times[team] = Math.max(0, state.times[team] - 1);
      UI.renderScore(state);
      if (state.times[team] <= 0) finishGame(team);
    }, 1000);
  }
  async function nextPhrase() {
    currentPhrase = Game.choosePhrase(phrasePool, lastPhrase); lastPhrase = currentPhrase;
    state.units = Game.getUnits(currentPhrase); state.selected = null; state.input = ""; state.solved = new Set(); state.sentenceNo++;
    $("sentence-count").textContent = (state.lang==="es" ? "Frase " : "Sentence ") + state.sentenceNo;
    $("progress-label").textContent = "";
    UI.showFeedback("");
  }
  function refresh() {
    if (!state) return;
    UI.renderScore(state);
    UI.renderSentence(state.units, {solved:state.solved, selected:state.selected, input:state.input, text:state.text, finished:state.finished, onSelect:selectCharacter});
    UI.renderKeyboard(addLetter, backspace, state.finished || state.selected===null);
    $("ok-btn").disabled = state.finished || state.selected===null || !state.input.length;
    $("clear-btn").disabled = state.finished || state.selected===null;
    $("skip-btn").disabled = state.finished || state.selected===null;
  }
  function selectCharacter(index) {
    if (!state || state.finished || !state.units[index] || !state.units[index].isHan || state.solved.has(index)) return;
    state.selected=index; state.input=""; UI.showFeedback(""); refresh();
  }
  function addLetter(letter) {
    if (!state || state.finished || state.selected===null || state.input.length>=8) return;
    state.input += letter; refresh();
  }
  function backspace() { if (!state || state.finished) return; state.input=state.input.slice(0,-1); refresh(); }
  function submitAnswer() {
    if (!state || state.finished || state.selected===null || !state.input) return;
    const unit=state.units[state.selected], expected=Game.normalize(unit.pinyin), given=Game.normalize(state.input);
    if (expected && expected===given) {
      state.scores[state.active]+=20; state.solved.add(state.selected); UI.showFeedback(text.correct,"good");
    } else {
      state.scores[state.active]-=10; UI.showFeedback(text.wrong + (unit.pinyin ? ` (${unit.pinyin})` : ""),"bad");
    }
    state.selected=null; state.input="";
    state.active = state.active==="panda" ? "dragon" : "panda";
    if (state.units.filter(u=>u.isHan).every((u,i)=>state.units.findIndex(v=>v===u)>=0) && state.solved.size>=state.units.filter(u=>u.isHan).length) {
      setTimeout(async () => { if (!state || state.finished) return; await nextPhrase(); refresh(); }, 450);
    } else refresh();
  }
  function skipCharacter() {
    if (!state || state.finished || state.selected===null) return;
    UI.showFeedback(text.skipped,"bad"); state.selected=null; state.input="";
    state.active=state.active==="panda" ? "dragon" : "panda"; refresh();
  }
  function onKeydown(event) {
    if (!state || state.finished || $("game-screen").hidden) return;
    if (/^[a-zA-Z]$/.test(event.key) && state.selected!==null) { addLetter(event.key.toLowerCase()); event.preventDefault(); }
    else if (event.key==="Backspace") { backspace(); event.preventDefault(); }
    else if (event.key==="Enter") { submitAnswer(); event.preventDefault(); }
  }
  function finishGame(reason) {
    if (!state || state.finished) return;
    stopTimer(); state.finished=true;
    let endedTeam = reason==="panda" || reason==="dragon" ? reason : null;
    if (endedTeam) {
      const rival = endedTeam==="panda" ? "dragon" : "panda";
      state.bonus=state.times[rival]; state.scores[rival]+=state.bonus;
    }
    const p=state.scores.panda, d=state.scores.dragon;
    $("winner-title").textContent = p===d ? text.draw : state.names[p>d ? "panda":"dragon"] + text.wins;
    $("winner-detail").textContent = endedTeam ? `${text.timeBonus} ${state.names[endedTeam==="panda"?"dragon":"panda"]}: +${state.bonus} ${text.seconds}.` : text.finished;
    $("final-panda-name").textContent=state.names.panda; $("final-dragon-name").textContent=state.names.dragon;
    $("final-panda-score").textContent=p; $("final-dragon-score").textContent=d;
    UI.showScreen("result");
  }
  document.addEventListener("DOMContentLoaded", init);
})();