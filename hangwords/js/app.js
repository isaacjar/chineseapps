// app.js — arranque y enlazado de UI
let settingsLocal = loadSettings();
let langStrings = {};   // se cargará vía fetch

/* ===========================
      CARGA LANG.JSON
=========================== */
async function loadLang() {
  try {
    const res = await fetch("js/lang.json");
    langStrings = await res.json();
    console.log("✓ lang.json cargado");
  } catch(e) {
    console.error("Error al cargar lang.json", e);
  }
}

/* ===========================
      BINDINGS UI
=========================== */
function initUIBindings(){
  // settings controls
  const selectLang = document.getElementById('selectLang');
  Object.keys(langStrings).forEach(k=>{
    const o = document.createElement('option'); o.value=k; o.textContent = k; selectLang.appendChild(o);
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

  document.getElementById('btnSettings').addEventListener('click', ()=>{
    setI18n(langStrings, settingsLocal.lang); 
    showScreen('settings');
  });
  document.getElementById('btnCloseLists').addEventListener('click', ()=>{ showScreen('game'); });

  document.getElementById('btnSaveSettings').addEventListener('click', ()=>{
    settingsLocal.lang = selectLang.value;
    settingsLocal.gametype = document.getElementById('selectGameType').value;
    settingsLocal.lives = Number(document.getElementById('inputLives').value);
    settingsLocal.questions = Number(document.getElementById('inputQuestions').value);
    saveSettings(settingsLocal);
    settings = loadSettings();
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

  document.getElementById('btnStats').addEventListener('click', ()=>{ 
    updateStatsUI(); 
    showScreen('stats'); 
  });
  document.getElementById('btnCloseStats').addEventListener('click', ()=>{ showScreen('game'); });
  document.getElementById('btnResetStats').addEventListener('click', ()=>{
    resetStats(); 
    updateStatsUI(); 
    toast('Stats reset'); 
  });

  document.getElementById('btnNew').addEventListener('click', ()=>{ startGame(); });

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
  await loadLang();                  // <---- carga JSON correctamente
  setI18n(langStrings, settingsLocal.lang);
  initUIBindings();
  
  await fetchVoclists();
  if (settingsLocal.voclist){
    await selectVoclist(settingsLocal.voclist);
  } else {
    await fetchAndShowLists();
  }
}

startApp();
