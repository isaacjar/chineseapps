// ui.js

(function () {
  'use strict';
  const HH = (window.HanziHint = window.HanziHint || {});
  const $ = (id) => document.getElementById(id);

  const UI = {
    els: {}, strings: {}, lang: 'en', errorKey: null, counter: null, view: null,

    init() {
      const ids = { counter: 'counter', random: 'btn-random', allSentences: 'btn-all-sentences', level: 'level-select', sentence: 'sentence-select',
        play: 'play', chars: 'chars', notice: 'pin-notice', trText: 'tr-text', error: 'error' };
      for (const k in ids) this.els[k] = $(ids[k]);
      this.els.trBtns = Array.from(document.querySelectorAll('[data-tr]'));
    },

    /** Registers every interface listener exactly once. */
    bind(h) {
      const e = this.els;
      e.level.addEventListener('change', () => h.onLevel(e.level.value));
      e.sentence.addEventListener('change', () => h.onSentence(Number(e.sentence.value)));
      e.random.addEventListener('click', h.onRandom);
      e.allSentences.addEventListener('click', h.onAllSentences);
      e.chars.addEventListener('click', (ev) => {
        const b = ev.target.closest('button.pin');
        if (b) h.onPin(Number(b.dataset.i));
      });
      e.trBtns.forEach((b) => b.addEventListener('click', () => h.onTranslation(b.dataset.tr)));
      let raf = 0;
      window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => this.layout()); });
    },

    t(key, vars) {
      const s = this.strings[key] != null ? this.strings[key] : key;
      return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : s;
    },

    setStrings(dict, lang) { this.strings = dict; this.lang = lang; this.applyStrings(); },

    applyStrings() {
      document.documentElement.lang = this.lang;
      document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
      document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const v = this.t(el.dataset.i18nAria);
        el.setAttribute('aria-label', v);
        if (el.tagName === 'BUTTON') el.title = v;
      });
      this.renderCounter(); this.renderError(); this.renderNotice(); this.renderTranslation();
      if (this.view) this.view.cells.forEach((c, i) => this.updatePin(i));
    },

    fillLevels(levels, current) {
      this.els.level.replaceChildren(...levels.map((l) => new Option(l.title || l.name, l.level)));
      this.els.level.value = current;
    },
    fillSentences(list, index) {
      this.els.sentence.replaceChildren(...list.map((s, i) => new Option(String(s.n), String(i))));
      if (list.length) this.els.sentence.value = String(index);
    },
    showAllSentences(list) {
      const frag = document.createDocumentFragment();    
      list.forEach((s) => {
        const item = document.createElement('div');
        item.className = 'sentence-item';
        item.textContent = s.ch;
        frag.appendChild(item);
      });    
      this.els.chars.replaceChildren(frag);
      this.els.play.classList.add('all-sentences-view');
    },
    showSingleSentence(sentence, info, shown, translation) {
      this.renderSentence(sentence, info, shown, translation);
    },
    setSentenceIndex(i) { this.els.sentence.value = String(i); },
    setEnabled(on) {
      this.els.sentence.disabled = !on; this.els.random.disabled = !on;
      this.els.trBtns.forEach((b) => { b.disabled = !on; });
    },

    setCounter(n, total) { this.counter = total ? { n, total } : null; this.renderCounter(); },
    renderCounter() { this.els.counter.textContent = this.counter ? this.t('counter', this.counter) : ''; },

    showError(key) { this.errorKey = key; this.view = null; this.els.play.hidden = true; this.els.error.hidden = false; this.renderError(); },
    renderError() { if (this.errorKey) this.els.error.textContent = this.t(this.errorKey); },

    renderSentence(sentence, info, shown, translation) {
      this.errorKey = null; this.els.error.hidden = true; this.els.play.hidden = false;
      this.els.play.classList.remove('all-sentences-view');
      this.view = { sentence, cells: info.cells, hasPins: info.hasPins, shown, translation };
      const frag = document.createDocumentFragment();
      info.cells.forEach((c, i) => {
        const cell = document.createElement('div'); cell.className = 'cell';
        if (!c.punct && c.pin) {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'pin' + (c.pin.length > 4 ? ' long' : '');
          b.dataset.i = i; b.textContent = c.pin; cell.appendChild(b);
        } else {
          const g = document.createElement('span'); g.className = 'pin-gap'; g.setAttribute('aria-hidden', 'true'); cell.appendChild(g);
        }
        const h = document.createElement('span'); h.className = 'han'; h.lang = 'zh-Hans'; h.textContent = c.ch;
        cell.appendChild(h); frag.appendChild(cell);
      });
      this.els.chars.replaceChildren(frag);
      info.cells.forEach((c, i) => this.updatePin(i));
      this.renderNotice(); this.layout(); this.renderTranslation();
      this.els.chars.classList.remove('enter'); void this.els.chars.offsetWidth; this.els.chars.classList.add('enter');
    },

    updatePin(i) {
      const b = this.els.chars.querySelector('button.pin[data-i="' + i + '"]');
      if (!b || !this.view) return;
      const c = this.view.cells[i], on = this.view.shown.has(i);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? this.t('pinAriaShown', { char: c.ch, pin: c.pin }) : this.t('pinAria', { char: c.ch }));
    },

    renderNotice() {
      const show = !!this.view && !this.view.hasPins;
      this.els.notice.hidden = !show; this.els.notice.textContent = show ? this.t('noPins') : '';
    },

    setTranslation(tr) { if (this.view) this.view.translation = tr; this.renderTranslation(); },
    renderTranslation() {
      const tr = this.view ? this.view.translation : null;
      this.els.trBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tr === tr)));
      const el = this.els.trText;
      el.lang = tr === 'sp' ? 'es' : 'en';
      el.textContent = tr ? (this.view.sentence[tr] || this.t('noTranslation')) : '';
    },

    /** Balances rows: e.g. 13 characters with max 12 per row become 2 rows of 7. */
    layout() {
      if (!this.view) return;
      const n = this.view.cells.length;
      const max = parseInt(getComputedStyle(this.els.play).getPropertyValue('--max-cols'), 10) || 8;
      const rows = Math.ceil(n / max);
      this.els.play.style.setProperty('--cols', String(Math.max(1, Math.ceil(n / rows))));
    }
  };
  HH.UI = UI;
})();
