// game.js

(function () { 
  'use strict';
  const HH = (window.HanziHint = window.HanziHint || {});
  const PUNCT = /^[\p{P}\p{S}\s]$/u;

  /** Pure game logic: no DOM access. */
  const Game = {
    sentences: [], index: 0, shownPins: new Set(), translation: null,

    sanitize(raw) {
      return raw.filter((s) => s && typeof s.ch === 'string' && s.ch.trim())
        .map((s, i) => ({ ...s, n: Number(s.n) > 0 ? Number(s.n) : i + 1 }));
    },
    setSentences(list) { this.sentences = list; this.index = 0; this.resetHelps(); },
    resetHelps() { this.shownPins.clear(); this.translation = null; },
    current() { return this.sentences[this.index] || null; },
    indexByNumber(n) { return this.sentences.findIndex((s) => s.n === Number(n)); },
    select(i) {
      if (!Number.isInteger(i) || i < 0 || i >= this.sentences.length) return false;
      this.index = i; this.resetHelps(); return true;
    },
    /** Random sentence of the loaded level; never the current one when others exist. */
    random() {
      const n = this.sentences.length;
      if (!n) return false;
      let i = 0;
      if (n > 1) { i = Math.floor(Math.random() * (n - 1)); if (i >= this.index) i++; }
      return this.select(i);
    },
    togglePin(i) { if (!this.shownPins.delete(i)) this.shownPins.add(i); },
    toggleTranslation(key) { this.translation = this.translation === key ? null : key; },

    /**
     * One cell per Unicode code point of `ch` (never splits surrogate pairs).
     * Pinyin comes only from `pins` when its length matches; otherwise no pinyin is
     * attributed to any character (hasPins=false) and the UI says so.
     */
    
    cells() {
      const s = this.current();
      if (!s) return { cells: [], hasPins: false };
    
      const chars = Array.from(s.ch);
      const units = [];
    
      // Trata 哪儿 y 点儿 como unidades únicas.
      for (let i = 0; i < chars.length; i++) {
        const pair = chars[i] + (chars[i + 1] || '');
    
        if (
          (pair === '哪儿' || pair === '点儿')
        ) {
          units.push(pair);
          i++;
        } else {
          units.push(chars[i]);
        }
      }
    
      // Cada elemento de pins debe corresponder a una unidad,
      // no necesariamente a un solo carácter chino.
      const ok =
        Array.isArray(s.pins) &&
        s.pins.length === units.length &&
        s.pins.every(p => typeof p === 'string');
    
      return {
        hasPins: ok,
        cells: units.map((ch, i) => {
          const punct = Array.from(ch).length === 1 && PUNCT.test(ch);
    
          return {
            ch,
            punct,
            pin: ok && !punct ? s.pins[i] : ''
          };
        })
      };
    }
  };
  HH.Game = Game;
})();
