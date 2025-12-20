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

function t(key, vars = {}) {
  let str = langStrings?.[settingsLocal.lang]?.[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v);
  });
  return str;
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
      selectLang.innerHTML = "";   
      const LANG_LABELS = {
        en: "English",
        es: "Español"
      };
      Object.keys(langStrings).forEach(k => {
        const o = document.createElement("option");
        o.value = k;
        o.textContent = LANG_LABELS[k] || k;
        selectLang.appendChild(o);
      });
      selectLang.value = settingsLocal.lang;


  /* ====== SETTINGS ====== */
  bind("btnSettings", () => {
    setI18n(langStrings, settingsLocal.lang);
    updateStatsUI();
    showScreen("settings");
  });

  bind("btnSaveSettings", () => {
    settingsLocal.lang = selectLang.value;
    saveSettings(settingsLocal);
    toast(t("settings_saved"));
    setI18n(langStrings, settingsLocal.lang);
    showScreen("lists");
  });

  bind("btnCancelSettings", () => showScreen("lists"));

  bind("btnResetSettings", () => {
    resetSettings();
    if (resetStats) resetStats();
    settingsLocal = loadSettings();
    updateStatsUI();
    toast(t("settings_reset"));
  });

  /* ====== LISTS ====== */
  bind("btnCloseLists", () => showScreen("game"));

  /* ====== Añadir palabras manualmente ====== */
  bind("btnAdd", () => {
    if (roundActive && !confirm(t("confirm_interrupt"))) return;
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

    toast(t("words_added", { n: words.length }));
  });

  /* ====== Añadir palabras desde JSON ====== */
  const addWordsFromJSON = async file => {
    if (roundActive && !confirm(t("confirm_interrupt"))) return;
    try {
      const res = await fetch(file);
      const data = await res.json();
      if (!Array.isArray(data)) return toast(t("invalid_format"));

      const words = data.map(w => String(w).trim()).filter(w => w.length >= 5);
      if (!words.length) return toast(t("no_valid_words"));

      window.customWordList = words;
      window.useCustomWords = true;
      window.currentVoc = null; // Limpiamos vocabulario antiguo

      startGame(window.customWordList);
      startNewRound();
      showScreen("game");

      toast(t("words_loaded", { n: words.length }));
    } catch (e) {
      console.error(e);
      toast(`${t("error_loading")}: ${file}`);
    }
  };

  bind("btnAddFromFileES", () => addWordsFromJSON("words_es.json"));
  bind("btnAddFromFileEN", () => addWordsFromJSON("words_en.json"));

  /* ====== Ver palabras ====== */
  bind("btnListWords", () => {
    if (roundActive && !confirm(t("confirm_show_words"))) return;

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

    if (!words.length) list.innerHTML = `<li>${t("no_words_loaded")}</li>`;
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
