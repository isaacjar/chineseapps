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
    //console.log("✓ lang.json cargado");
  } catch(e) {
    console.error("Error al cargar lang.json", e);
  }
}

/* ===========================
      CARGA LISTADOS VOCAB
=========================== */

// Espera a que voclists global (index.js) esté cargado
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

// Muestra la selección de listados
async function fetchAndShowLists() {
  const container = document.getElementById("voclistsContainer");
  if (!container) {
    console.warn("No existe #voclistsContainer");
    return;
  }

  container.innerHTML = "";

  voclistsIndex.forEach(list => {
    const btn = document.createElement("button");
    btn.className = "voclistItem";
    btn.textContent = `${list.title}`;
    btn.addEventListener("click", () => selectVoclist(list.filename));
    container.appendChild(btn);
  });

  showScreen("lists");
}

// Carga un vocabulario concreto
async function selectVoclist(filename) {
  try {
    const url = `../voclists/${filename}.json`; // ruta relativa desde hangwords/

    const res = await fetch(url);
    const vocData = await res.json();
    window.currentVoc = vocData; // asignamos global
    console.log("✓ vocabulario cargado", filename, window.currentVoc.length, "palabras total");

    settingsLocal.voclist = filename;
    saveSettings(settingsLocal);

    startGame();
    startNewRound();
    showScreen("game");

  } catch (e) {
    console.error("Error al cargar vocabulario", e);
  }
}

/* ===========================
      BINDINGS UI
=========================== */
function initUIBindings(){
  const overlay = $("modalOverlay");

  // --- Selección de idioma ---
  const selectLang = $("selectLang");
  Object.keys(langStrings).forEach(k=>{
    const o = document.createElement('option'); 
    o.value=k; 
    o.textContent = k; 
    selectLang.appendChild(o);
  });
  selectLang.value = settingsLocal.lang;

  // --- Otros inputs ---
  $("selectGameType").value = settingsLocal.gametype || 'chinese';
  $("inputLives").value = settingsLocal.lives; 
  $("livesValue").textContent = settingsLocal.lives;
  $("inputQuestions").value = settingsLocal.questions; 
  $("questionsValue").textContent = settingsLocal.questions;

  $("inputLives").addEventListener('input', e=>{
    $("livesValue").textContent = e.target.value;
  });
  $("inputQuestions").addEventListener('input', e=>{
    $("questionsValue").textContent = e.target.value;
  });

  // --- Botones de settings ---
  safe("btnSettings", ()=>{ setI18n(langStrings, settingsLocal.lang); showScreen('settings'); });
  safe("btnCloseLists", ()=>{ showScreen('game'); });

  safe("btnSaveSettings", ()=>{
    settingsLocal.lang = selectLang.value;
    settingsLocal.gametype = $("selectGameType").value;
    settingsLocal.lives = Number($("inputLives").value);
    settingsLocal.questions = Number($("inputQuestions").value);
    saveSettings(settingsLocal);
    toast('Settings saved');
    setI18n(langStrings, settingsLocal.lang);
    showScreen('lists');
  });

  safe("btnCancelSettings", ()=>{ showScreen('lists'); });
  safe("btnResetSettings", ()=>{
    resetSettings(); 
    settingsLocal = loadSettings(); 
    toast('Settings reset'); 
  });

  safe("btnCloseStats", ()=>{ showScreen('game'); });
  safe("btnResetStats", ()=>{
    resetStats(); 
    updateStatsUI(); 
    toast('Stats reset'); 
  });

  // --- Añadir palabras personalizadas ---
  safe("btnAdd", () => {
    if (roundActive) {
      if (!confirm("¿Desea interrumpir la partida actual?")) return;
    }

    const modal = $("customWordsModal");
    const input = $("customWordsInput");
    if (!modal || !input) return;

    input.value = "";
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
    input.focus();
  });

  safe("modalCancel", ()=>{
    $("customWordsModal")?.classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  });

  safe("modalOK", ()=>{
    const input = $("customWordsInput");
    if (!input) return;
    const words = input.value.split(/[\s,;.\r\n]+/).map(w=>w.trim()).filter(Boolean);
    if (!words.length) return;

    window.customWordList = words;
    window.useCustomWords = true;

    $("customWordsModal")?.classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");

    startNewRound();
    toast(`${words.length} palabras añadidas`);
  });

  // --- Ver palabras cargadas ---
  safe("btnListWords", ()=>{
    if (roundActive) {
      if (!confirm("¿Desea mostrar las palabras de juego?")) return;
    }

    const wordListContainer = $("wordListContainer");
    wordListContainer.innerHTML = "";

    let words = [];
    if (window.useCustomWords && Array.isArray(window.customWordList)) {
      words = window.customWordList.filter(w => w.replace(/\s/g,'').length>=5);
    } else if (window.currentVoc) {
      words = Object.values(window.currentVoc).map(v=>v.pin).filter(w => w.replace(/\s/g,'').length>=5);
    }

    if (!words.length) wordListContainer.innerHTML = "<li>No words loaded</li>";
    else words.forEach(w=>{
      const li = document.createElement("li");
      li.textContent = w;
      wordListContainer.appendChild(li);
    });

    $("wordListModal")?.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
  });

  safe("wordListClose", ()=>{
    $("wordListModal")?.classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  });

  // --- Keyboard events ---
  document.addEventListener('keydown', (e)=>{
    if (e.key && e.key.length===1){
      const ch = e.key.toLowerCase();
      const keyDiv = Array.from(document.querySelectorAll('.key'))
        .find(k=>k.textContent.toLowerCase()===ch);
      if (keyDiv) keyDiv.click();
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

  // borramos vocabulario en memoria
  window.currentVoc = [];

  // si hay voclist por URL, la cargamos, si no mostramos popup
  const urlParams = new URLSearchParams(window.location.search);
  const vocParam = urlParams.get("voclist");

  if (vocParam) {
    settingsLocal.voclist = vocParam;
    await selectVoclist(vocParam);
  } else {
    settingsLocal.voclist = null;
    await fetchAndShowLists();
  }
}

// al cerrar o recargar la página, borramos vocabulario de memoria
window.addEventListener('beforeunload', ()=>{
  window.currentVoc = [];
  settingsLocal.voclist = null;
  saveSettings(settingsLocal);
});

// Refresca la app al pulsar sobre el logo o título
const brand = document.querySelector(".brand");
if (brand) {
    brand.style.cursor = "pointer"; // cursor de mano para indicar que es clicable
    brand.addEventListener("click", () => {
        location.reload();
    });
}

startApp();
