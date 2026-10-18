// settings.js

(function () {
  'use strict';
  const HH = (window.HanziHint = window.HanziHint || {});
  const KEY = 'hanzihint.prefs';
  const LANGS = ['en', 'es'];
  const DEFAULTS = { lang: 'en', level: null, sentence: null };

  // localStorage may be missing or throw (private mode, blocked): never let it break the app.
  const store = {
    read() { try { const r = localStorage.getItem(KEY); const o = r ? JSON.parse(r) : {}; return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } },
    write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
  };
  const lang = (v) => (LANGS.includes(v) ? v : null);
  const num = (v) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; };

  const Settings = {
    current: { ...DEFAULTS }, saved: {},

    /**
     * PRIORITY (highest first): 1) URL parameters  2) localStorage  3) defaults.
     * Invalid values fall through to the next source; unknown level -> first level.
     */
    resolve(levels) {
      let q = {};
      try { const p = new URLSearchParams(location.search); q = { lang: p.get('lang'), level: p.get('level'), sentence: p.get('sentence') }; } catch (e) { /* ignore */ }
      this.saved = store.read();
      const ids = levels.map((l) => l.level);
      const level = ids.includes(q.level) ? q.level : ids.includes(this.saved.level) ? this.saved.level : (ids[0] || null);
      const sentence = num(q.sentence) || (this.saved.level === level ? num(this.saved.sentence) : null) || null;
      this.current = { lang: lang(q.lang) || lang(this.saved.lang) || DEFAULTS.lang, level, sentence };
      return this.current;
    },
    update(part) { Object.assign(this.current, part); Object.assign(this.saved, part); store.write(this.saved); },
    reset() { store.clear(); this.saved = {}; this.current = { ...DEFAULTS }; return this.current; },

    bindModal({ getLang, onSave, onReset }) {
      const $ = (id) => document.getElementById(id);
      const dlg = $('settings-dialog'), sel = $('lang-select');
      $('btn-settings').addEventListener('click', () => { sel.value = getLang(); dlg.showModal(); });
      $('btn-save').addEventListener('click', () => { dlg.close(); onSave(lang(sel.value) || DEFAULTS.lang); });
      $('btn-reset').addEventListener('click', () => { dlg.close(); onReset(); });
      $('btn-cancel').addEventListener('click', () => dlg.close());
    }
  };
  HH.Settings = Settings;
})();
