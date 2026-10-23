(() => {
  "use strict";
  const DATA_BASE = "https://isaacjar.github.io/chineseapps/hanzihint/data/";
  const FALLBACK_CATALOG = [
    {level:"newh1", lesson:"01", name:"newh101", title:"New HSK 1 Lesson 1"},
    {level:"newh1", lesson:"99", name:"newh1", title:"New HSK 1 (full)"},
    {level:"newh2", lesson:"99", name:"newh2", title:"New HSK 2 (full)"},
    {level:"hsk", name:"sentences", title:"Sentences (all levels)"}
  ];
  const TEXT = {
    en:{subtitle:"Chinese character battle",newGame:"New game",setupTitle:"Prepare for battle!",setupIntro:"Choose your lesson and teams.",levelLesson:"Level and lesson",pandaName:"🐼 Panda team",dragonName:"🐉 Dragon team",timePerTeam:"Time per team",language:"Language",start:"Start battle ⚔️",timeLeft:"Time left",clear:"Clear",ok:"OK ✓",skip:"Skip character",endGame:"End game",playAgain:"Play again",loading:"Loading lessons…",loadError:"Could not load the lesson data. Check your connection and the data file paths.",choose:"Select a lesson",turn:"'s turn!",selectChar:"Select the next Chinese character to read.",typePinyin:"Type the pinyin using the letters below.",correct:"Correct! +20 points",wrong:"Not quite! −10 points",skipped:"Character skipped.",finished:"Battle complete!",wins:"wins!",draw:"It's a draw!",timeBonus:"The remaining time was added to the score.",noChars:"No unread Chinese characters in this sentence — next one!",loadingSentence:"Loading sentence…",seconds:"seconds"},
    es:{subtitle:"Duelo de caracteres chinos",newGame:"Nueva partida",setupTitle:"¡Preparaos para la batalla!",setupIntro:"Elige la lección y los equipos.",levelLesson:"Nivel y lección",pandaName:"🐼 Equipo Panda",dragonName:"🐉 Equipo Dragón",timePerTeam:"Tiempo por equipo",language:"Idioma",start:"¡Empezar batalla! ⚔️",timeLeft:"Tiempo restante",clear:"Borrar",ok:"OK ✓",skip:"Saltar carácter",endGame:"Terminar",playAgain:"Jugar otra vez",loading:"Cargando lecciones…",loadError:"No se han podido cargar los datos. Comprueba la conexión y las rutas de los archivos.",choose:"Elige una lección",turn:" juega ahora",selectChar:"Selecciona el siguiente carácter chino que hay que leer.",typePinyin:"Introduce el pinyin con las letras de abajo.",correct:"¡Correcto! +20 puntos",wrong:"¡No es correcto! −10 puntos",skipped:"Carácter omitido.",finished:"¡Partida terminada!",wins:" gana!",draw:"¡Empate!",timeBonus:"El tiempo restante se ha añadido a la puntuación.",noChars:"No quedan caracteres chinos en esta frase: ¡siguiente!",loadingSentence:"Cargando frase…",seconds:"segundos"}
  };
  async function loadCatalog() {
    let list = Array.isArray(window.HANZIHINT_LEVELS) ? window.HANZIHINT_LEVELS : [];
    if (!list.length) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = DATA_BASE + "index.js";
          script.onload = resolve; script.onerror = reject;
          document.head.appendChild(script);
        });
        list = Array.isArray(window.HANZIHINT_LEVELS) ? window.HANZIHINT_LEVELS : [];
      } catch (_) {}
    }
    return list.length ? list : FALLBACK_CATALOG;
  }
  function getTitle(item) { return item.title || item.name || item.level || "Lesson"; }
  function getFileCandidates(item) {
    const names = [];
    if (item.name) names.push(item.name);
    if (item.level && item.lesson && item.lesson !== "99") names.push(item.level + item.lesson);
    if (item.level) names.push(item.level);
    return [...new Set(names)].map(name => DATA_BASE + encodeURIComponent(name) + ".json");
  }
  async function fetchDataset(item) {
    let lastError;
    for (const url of getFileCandidates(item)) {
      try {
        const response = await fetch(url, {cache:"no-cache"});
        if (!response.ok) throw new Error("HTTP " + response.status + " for " + url);
        const data = await response.json();
        const phrases = Array.isArray(data) ? data : (Array.isArray(data.phrases) ? data.phrases : Array.isArray(data.sentences) ? data.sentences : []);
        if (phrases.length) {
          if (item.lesson && item.lesson !== "99" && phrases.some(p => p.less !== undefined && p.less !== null)) {
            const lessonNumber = Number(item.lesson);
            const filtered = phrases.filter(p => String(p.less).trim() === String(item.lesson).trim() || Number(p.less) === lessonNumber);
            if (filtered.length) return filtered;
          }
          return phrases;
        }
        throw new Error("No phrase records in " + url);
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error("No matching data file found");
  }
  function fillSelect(select, catalog, lang) {
    select.replaceChildren();
    catalog.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = getTitle(item);
      select.appendChild(option);
    });
    select.setAttribute("aria-label", TEXT[lang].levelLesson);
  }
  window.HanziClashSetup = {DATA_BASE, TEXT, loadCatalog, fetchDataset, fillSelect};
})();