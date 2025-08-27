import { initI18n, t, setLanguage, currentLangCode } from './i18n.js';
import { initState, getSettings } from './state.js';
import { renderMenu } from './ui.js';
import { initSettings } from './settings.js';
import { navigate, onRouteChange } from './router.js';
import './games/game-recognition.js';
import './games/game-reverse.js';
import './games/game-pinyin-from-chars.js';
import './games/game-pinyin-from-digits.js';
import './games/game-memory.js';

const elView = document.getElementById('view');
const elHudLang = document.getElementById('hud-language');
const elBtnSettings = document.getElementById('btn-open-settings');

async function bootstrap(){
  await initI18n();
  initState();
  initSettings();

  document.getElementById('app-title').textContent = 'HanShu 🌿';
  document.getElementById('app-subtitle').textContent = '数字 • Números • Numbers';
  elBtnSettings.querySelector('span').textContent = t('ui.settings');

  elHudLang.textContent = `🌎 ${currentLangCode().toUpperCase()}`;

  renderMenu(elView);

  onRouteChange((route) => {
    // Could handle analytics or breadcrumbs
  });

  elBtnSettings.addEventListener('click', () => {
    const evt = new CustomEvent('open-settings');
    window.dispatchEvent(evt);
  });

  // Language switch with click on HUD (quick toggle demo)
  elHudLang.addEventListener('click', async () => {
    const codes = ['en','es','fr','pt','de','ur'];
    const cur = currentLangCode();
    const next = codes[(codes.indexOf(cur)+1) % codes.length];
    await setLanguage(next);
    elHudLang.textContent = `🌎 ${next.toUpperCase()}`;
    // Re-render current view
    const route = location.hash.slice(1) || 'menu';
    if(route === 'menu') renderMenu(elView);
    else navigate(route); // games re-render own UI
  });

  // Default route
  if(!location.hash) navigate('menu');
  else navigate(location.hash.slice(1));
}

bootstrap();
