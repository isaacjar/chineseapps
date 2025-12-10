// ui.js — mostrar/ocultar pantallas y pequeños helpers
const screens = {
  lists: document.getElementById('screen-lists'),
  settings: document.getElementById('screen-settings'),
  stats: document.getElementById('screen-stats'),
  game: document.getElementById('screen-game')
};

function showScreen(name){
  Object.values(screens).forEach(s=>s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

function toast(msg, timeout=1800){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._to);
  t._to = setTimeout(()=>t.classList.add('hidden'), timeout);
}

function setI18n(strings, selectedLang){
  // fill simple labels: elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if (strings[selectedLang] && strings[selectedLang][key]) el.textContent = strings[selectedLang][key];
  });
}
