// app.js — arranque y enlazado de UI
window.settingsLocal = loadSettings();
let settingsLocal = window.settingsLocal;
window.currentVoc = [];   // global para game.js
let voclistsIndex = [];   // copia local de la lista de listados

/* ===========================
      CARGA LANG.JSON
=========================== */
async function loadLang() {
  try {
    const res = await fetch("js/lang.json");
    langStrings = await res.json();
  } catch(e) {
    console.error("Error al cargar lang.json", e);
  }
}

/* ===========================
      CARGA LISTADOS VOCAB
=========================== */
function fetchVoclists() {
  return new Promise((resolve, reject) => {
    if (typeof voclists !== "undefined" && Array.isArray(voclists)) {
      voclistsIndex = voclists;
      console.log("📄Voclists cargados:", voclistsIndex.length);
      resolve(voclistsIndex);
    } else {
      console.error("voclists.js no ha inicializado voclists");
      reject("voclists.js no inicializado");
    }
  });
}

async function fetchAndShowLists() {
  const container = $("voclistsContainer");
  if (!container) return;

  container.innerHTML = "";
  voclistsIndex.forEach(list => {
    const btn = document.createElement("button");
    btn.className = "voclistItem";
    btn.textContent = list.title;
    btn.addEventListener("click", () => selectVoclist(list.filename));
    container.appendChild(btn);
  });

  showScreen("lists");
}

async function selectVoclist(filename) {
  try {
    const url = `../voclists/${filename}.json`;
    const res = await fetch(url);
    const vocData = await res.json();
    window.currentVoc = vocData;
    console.log("✓ vocabulario cargado", filename, vocData.length, "palabras total");

    settingsLocal.voclist = filename;
    saveSettings(settingsLocal);

    startGame();
    startNewRound();
    showScreen("game");

  } catch(e) {
    console.error("Error al cargar vocabulario", e);
  }
}

/* ===========================
      BINDINGS UI
=========================== */
function initUIBindings() {
  const overlay = $("modalOverlay");
  const bind = (id, fn) => {
    const el = $(id);
    if (!el || typeof fn !== "function") return;
    el.addEventListener("click", fn);
  };

  /* Idioma */
  const selectLang = $("selectLang");
  Object.keys(langStrings).forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = k;
    selectLang.appendChild(o);
  });
  selectLang.value = settingsLocal.lang;

  /* ====== SETTINGS ====== */
  /*function updateSettingsStatsUI() {
    const container = $("settingsStats");
    if (!container) return;

    const stats = loadStats ? loadStats() : {};
    container.innerHTML = `
      <div>Games played: ${stats.gamesPlayed || 0}</div>
      <div>Words guessed: ${stats.wordsGuessed || 0}</div>
      <div>Correct letters: ${stats.correctLetters || 0}</div>
    `;
  }*/

  bind("btnSettings", () => {
    setI18n(langStrings, settingsLocal.lang);
    //updateSettingsStatsUI();
    updateStatsUI();
    showScreen("settings");
  });

  bind("btnSaveSettings", () => {
    settingsLocal.lang = selectLang.value;
    saveSettings(settingsLocal);
    toast("Settings saved");
    setI18n(langStrings, settingsLocal.lang);
    showScreen("lists");
  });

  bind("btnCancelSettings", () => showScreen("lists"));

  bind("btnResetSettings", () => {
    resetSettings();
    if (resetStats) resetStats();
    settingsLocal = loadSettings();
    updateSettingsStatsUI();
    toast("Settings and stats reset");
  });

  /* ====== LISTS ====== */
  bind("btnCloseLists", () => showScreen("game"));

  /* ====== Añadir palabras manualmente ====== */
  bind("btnAdd", () => {
    if (roundActive && !confirm("¿Desea interrumpir la partida actual?")) return;
    $("customWordsInput").value = "";
    $("customWordsModal").classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
    $("customWordsInput").focus();
  });

  bind("modalCancel", () => {
    $("customWordsModal").classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  });

  bind("modalOK", () => {
    const words = $("customWordsInput").value
      .split(/[\s,;.\r\n]+/)
      .map(w => w.trim())
      .filter(w => w.length >= 5);

    if (!words.length) return;

    window.customWordList = words;
    window.useCustomWords = true;
    window.currentVoc = null; // Limpiamos vocabulario antiguo

    $("customWordsModal").classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");

    startGame(window.customWordList);
    startNewRound();
    showScreen("game");

    toast(`${words.length} palabras añadidas`);
  });

  /* ====== Añadir palabras desde JSON ====== */
  const addWordsFromJSON = async file => {
    if (roundActive && !confirm("¿Desea interrumpir la partida actual?")) return;
    try {
      const res = await fetch(file);
      const data = await res.json();
      if (!Array.isArray(data)) return toast("Formato incorrecto");

      const words = data.map(w => String(w).trim()).filter(w => w.length >= 5);
      if (!words.length) return toast("No hay palabras válidas");

      window.customWordList = words;
      window.useCustomWords = true;
      window.currentVoc = null; // Limpiamos vocabulario antiguo

      startGame(window.customWordList);
      startNewRound();
      showScreen("game");

      toast(`${words.length} palabras cargadas`);
    } catch (e) {
      console.error(e);
      toast(`Error cargando ${file}`);
    }
  };

  bind("btnAddFromFileES", () => addWordsFromJSON("words_es.json"));
  bind("btnAddFromFileEN", () => addWordsFromJSON("words_en.json"));

  /* ====== Ver palabras ====== */
  bind("btnListWords", () => {
    if (roundActive && !confirm("¿Desea mostrar las palabras de juego?")) return;

    const list = $("wordListContainer");
    list.innerHTML = "";

    let words = [];
    if (window.useCustomWords && Array.isArray(window.customWordList)) {
      words = window.customWordList;
    } else if (window.currentVoc) {
      words = Object.values(window.currentVoc)
        .map(v => v.pin)
        .filter(Boolean);
    }

    if (!words.length) list.innerHTML = "<li>No words loaded</li>";
    else words.forEach(w => {
      const li = document.createElement("li");
      li.textContent = w;
      list.appendChild(li);
    });

    $("wordListModal").classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
  });

  bind("wordListClose", () => {
    $("wordListModal").classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  });

  /* ====== Teclado ====== */
  document.addEventListener("keydown", e => {
    if (e.key?.length === 1) {
      const btn = [...document.querySelectorAll(".key")]
        .find(b => b.textContent.toLowerCase() === e.key.toLowerCase());
      btn?.click();
    }
  });
}

/* ===========================
      ARRANQUE DE LA APP
=========================== */
async function startApp(){
  await loadLang();
  setI18n(langStrings, settingsLocal.lang);
  initUIBindings();
  await fetchVoclists();

  window.currentVoc = [];

  const urlParams = new URLSearchParams(window.location.search);
  const vocParam = urlParams.get("voclist");

  if (vocParam) {
    settingsLocal.voclist = vocParam;
    saveSettings(settingsLocal);
    await selectVoclist(vocParam);
  } else if (window.useCustomWords && Array.isArray(window.customWordList) && window.customWordList.length) {
    startGame(window.customWordList);
    startNewRound();
    showScreen("game");
  } else {
    settingsLocal.voclist = null;
    await fetchAndShowLists();
  }
}

window.addEventListener('beforeunload', ()=>{
  window.currentVoc = [];
  settingsLocal.voclist = null;
  saveSettings(settingsLocal);
});

const brand = document.querySelector(".brand");
if (brand) {
  brand.style.cursor = "pointer";
  brand.addEventListener("click", () => location.reload());
}

startApp();
