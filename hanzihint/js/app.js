// app.js

(function () {
  'use strict';
  const { Game, Settings, UI } = window.HanziHint;
  const FALLBACK = { errCatalog: 'No levels found. Check data/index.js.', errLoad: 'Could not load lang.json.' };
  let langs = { en: FALLBACK }, levels = [], levelId = null, token = 0, controller = null;
  let showingAllSentences = false;

  class LoadError extends Error { constructor(key) { super(key); this.key = key; } }

  async function loadLangs() {
    try {
      const r = await fetch('lang.json');
      if (!r.ok) throw new Error('http');
      langs = await r.json();
    } catch (e) { langs = { en: FALLBACK }; }
  }
  function setLang(code) {
    Settings.current.lang = code;
    UI.setStrings(langs[code] || langs.en || FALLBACK, code);
  }

  function render() {
    const s = Game.current();
    UI.renderSentence(s, Game.cells(), Game.shownPins, Game.translation);
    UI.setSentenceIndex(Game.index);
    UI.setCounter(s.n, Game.sentences.length);
    Settings.update({ level: levelId, sentence: s.n });
  }

  async function loadLevel(id, sentenceNum) {
    const entry = levels.find((l) => l.name === id) || levels[0];
    const mine = ++token;
    if (controller) controller.abort();          // a newer request cancels the older one
    controller = new AbortController();
    try {
      let res;
      try { res = await fetch('data/' + encodeURIComponent(entry.name) + '.json', { signal: controller.signal }); }
      catch (e) { if (e.name === 'AbortError') throw e; throw new LoadError('errLoad'); }
      if (!res.ok) throw new LoadError('errLoad');
      let raw;
      try { raw = await res.json(); } catch (e) { if (e.name === 'AbortError') throw e; throw new LoadError('errInvalid'); }
      if (mine !== token) return;                // stale response: ignore
      if (!Array.isArray(raw)) throw new LoadError('errInvalid');
      const list = Game.sanitize(raw);
      if (!list.length) throw new LoadError(raw.length ? 'errInvalid' : 'errEmpty');
      levelId = entry.name;
      showingAllSentences = false;
      Game.setSentences(list);
      const idx = sentenceNum ? Game.indexByNumber(sentenceNum) : -1;
      Game.select(idx >= 0 ? idx : 0);
      UI.fillLevels(levels, levelId);
      UI.fillSentences(list, Game.index);
      UI.setEnabled(true);
      render();
    } catch (e) {
      if (e.name === 'AbortError' || mine !== token) return;
      levelId = entry.name;
      Game.setSentences([]);
      UI.fillLevels(levels, levelId); UI.fillSentences([], 0);
      UI.setEnabled(false); UI.setCounter(0, 0);
      UI.showError(e instanceof LoadError ? e.key : 'errLoad');
    }
  }

  async function boot() {
    UI.init();
    await loadLangs();
    levels = Array.isArray(window.HANZIHINT_LEVELS) ? window.HANZIHINT_LEVELS.filter((l) => l && l.level && l.name) : [];
    const prefs = Settings.resolve(levels);
    setLang(prefs.lang);
    UI.bind({
      onLevel: (id) => loadLevel(id, null),
      onSentence: (i) => { if (Game.select(i)) render(); },
      onRandom: () => { if (Game.random()) render(); },
      onAllSentences: () => {
        if (showingAllSentences) {
          showingAllSentences = false;
          render();
        } else {
          showingAllSentences = true;
          UI.showAllSentences(Game.sentences);
        }
      },
      onPin: (i) => { Game.togglePin(i); UI.updatePin(i); },
      //onTranslation: (k) => { Game.toggleTranslation(k); UI.setTranslation(Game.translation); }
      onTranslation: () => {
        const lang = Settings.current.lang === 'es' ? 'sp' : 'en';
        Game.toggleTranslation(lang);
        UI.setTranslation(Game.translation);
      }
    });
    Settings.bindModal({
      getLang: () => Settings.current.lang,
      onSave: (code) => { Settings.update({ lang: code }); setLang(code); },
      onReset: () => { const d = Settings.reset(); setLang(d.lang); if (levels.length) loadLevel(levels[0].level, null); }
    });
    if (!levels.length) { UI.setEnabled(false); UI.showError('errCatalog'); return; }
    const initial = levels.find((l) => l.name === prefs.level || l.level === prefs.level) || levels[0];
    await loadLevel(initial.name, prefs.sentence);
  }
  boot();
})();
