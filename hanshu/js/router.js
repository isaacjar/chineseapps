// router.js
import { renderMenu } from './menu.js';
import { startRecognition } from './games/game-recognition.js';
import { startReverse } from './games/game-reverse.js';
import { startPinyinFromChars } from './games/game-pinyin-from-chars.js';
import { startPinyinFromDigits } from './games/game-pinyin-from-digits.js';
import { startMemory } from './games/game-memory.js';
import { openSettings } from './settings.js';

// Enrutador SPA muy simple
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // procesar ruta inicial
}

function handleRoute() {
  const view = document.querySelector('#view');
  if (!view) return;

  const route = window.location.hash.replace('#', '') || 'menu';

  switch (route) {
    case 'menu':
      renderMenu();
      break;
    case 'recognition':
      startRecognition();
      break;
    case 'reverse':
      startReverse();
      break;
    case 'pinyin-chars':
      startPinyinFromChars();
      break;
    case 'pinyin-digits':
      startPinyinFromDigits();
      break;
    case 'memory':
      startMemory();
      break;
    case 'settings':
      openSettings();
      break;
    default:
      renderMenu(); // fallback al menú
  }
}
