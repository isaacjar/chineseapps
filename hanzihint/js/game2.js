(() => {
  "use strict";
  const normalize = value => String(value || "").toLowerCase().replace(/[üǖǘǚǜ]/g, "u").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/v/g, "u").replace(/[^a-z]/g, "");
  const isHan = char => /\p{Script=Han}/u.test(char);
  const isPunctuation = char => !isHan(char) && !/[a-zA-Z0-9]/.test(char);
  function parsePinyin(phrase, index) {
    const pins = Array.isArray(phrase.pins) ? phrase.pins : [];
    const direct = pins[index];
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    const chars = Array.from(phrase.ch || "");
    const syllables = String(phrase.pin || "").trim().split(/\s+/);
    const hanIndices = chars.map((ch, i) => isHan(ch) ? i : -1).filter(i => i >= 0);
    const hanPos = hanIndices.indexOf(index);
    return hanPos >= 0 ? (syllables[hanPos] || "") : "";
  }
  function getUnits(phrase) {
    const chars = Array.from(String(phrase.ch || ""));
    return chars.map((char, index) => ({char, index, pinyin:parsePinyin(phrase,index), isHan:isHan(char), punctuation:isPunctuation(char)}));
  }
  function choosePhrase(phrases, previous) {
    const valid = phrases.filter(p => String(p.ch || "").trim() && Array.from(String(p.ch)).some(isHan));
    if (!valid.length) throw new Error("No phrases with Chinese characters found in this data set.");
    let options = valid;
    if (valid.length > 1 && previous) options = valid.filter(p => p !== previous);
    return options[Math.floor(Math.random() * options.length)];
  }
  window.HanziClashGame = {normalize, isHan, getUnits, choosePhrase};
})();