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
    showScreen("game");

  } catch (e) {
    console.error("Error al cargar vocabulario", e);
  }
}

/* ===========================
      BINDINGS UI
=========================== */
function initUIBindings(){
  const selectLang = document.getElementById('selectLang');
  Object.keys(langStrings).forEach(k=>{
    const o = document.createElement('option'); 
    o.value=k; 
    o.textContent = k; 
    selectLang.appendChild(o);
  });
  selectLang.value = settingsLocal.lang;

  document.getElementById('selectGameType').value = settingsLocal.gametype || 'chinese';
  document.getElementById('inputLives').value = settingsLocal.lives; 
  document.getElementById('livesValue').textContent = settingsLocal.lives;
  document.getElementById('inputQuestions').value = settingsLocal.questions; 
  document.getElementById('questionsValue').textContent = settingsLocal.questions;

  document.getElementById('inputLives').addEventListener('input', e=>{
    document.getElementById('livesValue').textContent = e.target.value;
  });
  document.getElementById('inputQuestions').addEventListener('input', e=>{
    document.getElementById('questionsValue').textContent = e.target.value;
  });

  document.getElementById('btnSettings').addEventListener('click', ()=>{ setI18n(langStrings, settingsLocal.lang); showScreen('settings'); });
  document.getElementById('btnCloseLists').addEventListener('click', ()=>{ showScreen('game'); });

  document.getElementById('btnSaveSettings').addEventListener('click', ()=>{
    settingsLocal.lang = selectLang.value;
    settingsLocal.gametype = document.getElementById('selectGameType').value;
    settingsLocal.lives = Number(document.getElementById('inputLives').value);
    settingsLocal.questions = Number(document.getElementById('inputQuestions').value);
    saveSettings(settingsLocal);
    toast('Settings saved');
    setI18n(langStrings, settingsLocal.lang);
    showScreen('lists');
  });

  document.getElementById('btnCancelSettings').addEventListener('click', ()=>{ showScreen('lists'); });
  document.getElementById('btnResetSettings').addEventListener('click', ()=>{
    resetSettings(); 
    settingsLocal = loadSettings(); 
    toast('Settings reset'); 
  });

  // document.getElementById('btnStats').addEventListener('click', ()=>{ updateStatsUI(); showScreen('stats'); });
  document.getElementById('btnCloseStats').addEventListener('click', ()=>{ showScreen('game'); });
  document.getElementById('btnResetStats').addEventListener('click', ()=>{
    resetStats(); 
    updateStatsUI(); 
    toast('Stats reset'); 
  });

  //document.getElementById('btnNew').addEventListener('click', ()=>{ startGame(); });
  
  document.getElementById("btnAdd").addEventListener("click", () => {
    const modal = document.getElementById("customWordsModal");
    const input = document.getElementById("customWordsInput");
    input.value = "";
    modal.classList.remove("hidden");
    input.focus();
  });

  // keyboard events
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
