(() => {
  "use strict";
  const normalize = value => String(value || "").toLowerCase().replace(/[üǖǘǚǜ]/g, "u").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/v/g, "u").replace(/[^a-z]/g, "");
  const isHan = char => /\p{Script=Han}/u.test(char);
  const isPunctuation = char => !isHan(char) && !/[a-zA-Z0-9]/.test(char);
  function parsePinyin(phrase, index) {
    const chars = Array.from(phrase.ch || "");
    const char = chars[index];
    if (!char || !isHan(char)) return "";
    const pins = Array.isArray(phrase.pins) ? phrase.pins : [];
    // Calcular la posición contando únicamente caracteres chinos.
    let hanPos = 0;
    for (let i = 0; i < index; i++) {
      if (isHan(chars[i])) hanPos++;
    }
    // pins contiene una sílaba por cada carácter chino.
    const direct = pins[hanPos];
    if (typeof direct === "string" && direct.trim()) {
      return direct.trim();
    }
    // Alternativa: recuperar las sílabas desde el pinyin completo.
    const syllables = String(phrase.pin || "").trim().split(/\s+/);
    return syllables[hanPos] || "";
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
