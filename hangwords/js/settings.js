// settings.js — manejo de configuración y parámetros URL
const SETTINGS_KEY = 'hangwords_settings_v1';
const DEFAULTS = {
  lang: 'en',
  gametype: 'chinese', // 'chinese' or 'spanish'
  lives: 10,
  questions: 10,
  voclist: null
};

function readUrlParams(){
  const params = new URLSearchParams(location.search);
  const config = {};
  ['lang','gametype','lives','questions','voclist'].forEach(k=>{
    if (params.has(k)) config[k] = params.get(k);
  });
  return config;
}

function loadSettings(){
  const raw = localStorage.getItem(SETTINGS_KEY);
  let s = raw ? JSON.parse(raw) : {};
  s = Object.assign({}, DEFAULTS, s);
  // override with URL params if present
  const url = readUrlParams();
  if (url.lang) s.lang = url.lang;
  if (url.gametype) s.gametype = url.gametype;
  if (url.lives) s.lives = Number(url.lives);
  if (url.questions) s.questions = Number(url.questions);
  if (url.voclist) s.voclist = url.voclist;
  return s;
}

function saveSettings(settings){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function resetSettings(){
  localStorage.removeItem(SETTINGS_KEY);
}

// Inicializar configuración global
window.settingsLocal = loadSettings();
