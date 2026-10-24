
 // game.js

(function () {
  'use strict';

  const HH = (window.HanziHint = window.HanziHint || {});
  const PUNCT = /^[\p{P}\p{S}\s]$/u;
  const HAN = /\p{Script=Han}/u;

  /** Pure game logic: no DOM access. */
  const Game = {
    sentences: [],
    index: 0,
    shownPins: new Set(),
    translation: null,

    sanitize(raw) {
      return raw
        .filter((s) => s && typeof s.ch === 'string' && s.ch.trim())
        .map((s, i) => ({
          ...s,
          n: Number(s.n) > 0 ? Number(s.n) : i + 1
        }));
    },

    setSentences(list) {
      this.sentences = list;
      this.index = 0;
      this.resetHelps();
    },

    resetHelps() {
      this.shownPins.clear();
      this.translation = null;
    },

    current() {
      return this.sentences[this.index] || null;
    },

    indexByNumber(n) {
      return this.sentences.findIndex((s) => s.n === Number(n));
    },

    select(i) {
      if (!Number.isInteger(i) || i < 0 || i >= this.sentences.length) {
        return false;
      }

      this.index = i;
      this.resetHelps();
      return true;
    },

    /** Random sentence of the loaded level; never the current one when others exist. */
    random() {
      const n = this.sentences.length;
      if (!n) return false;

      let i = 0;

      if (n > 1) {
        i = Math.floor(Math.random() * (n - 1));
        if (i >= this.index) i++;
      }

      return this.select(i);
    },

    togglePin(i) {
      if (!this.shownPins.delete(i)) this.shownPins.add(i);
    },

    toggleTranslation(key) {
      this.translation = this.translation === key ? null : key;
    },

    /**
     * Creates one cell per character, grouping 哪儿 and 点儿.
     * Punctuation does not consume a pinyin position.
     * Each pins entry corresponds to one Chinese unit.
     */
    cells() {
      const s = this.current();

      if (!s) {
        return { cells: [], hasPins: false };
      }

      const chars = Array.from(s.ch);
      const units = [];

      // Group 哪儿 and 点儿 as single units.
      for (let i = 0; i < chars.length; i++) {
        const pair = chars[i] + (chars[i + 1] || '');

        if (pair === '哪儿' || pair === '点儿') {
          units.push(pair);
          i++;
        } else {
          units.push(chars[i]);
        }
      }

      // Punctuation and spaces do not require pinyin entries.
      const isPunctuation = (ch) =>
        Array.from(ch).length === 1 && PUNCT.test(ch);

      // Count only Chinese units, including grouped units such as 哪儿.
      const chineseUnits = units.filter((ch) => !isPunctuation(ch));

      const ok =
        Array.isArray(s.pins) &&
        s.pins.length === chineseUnits.length + 1 &&
        s.pins.every((p) => typeof p === 'string') &&
        s.pins[s.pins.length - 1] === '';

      let pinIndex = 0;

      const cells = units.map((ch) => {
        const punct = isPunctuation(ch);

        if (punct) {
          return {
            ch,
            punct: true,
            pin: ''
          };
        }

        const pin = ok ? s.pins[pinIndex] : '';
        pinIndex++;

        return {
          ch,
          punct: false,
          pin
        };
      });

      return {
        cells,
        hasPins: ok
      };
    }
  };

  HH.Game = Game;
})();
