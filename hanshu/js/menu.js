// router.js
import { renderMenu } from './menu.js';
import { startRecognition } from './games/game-recognition.js';
import { startReverse } from './games/game-reverse.js';
import { startPinyinFromChars } from './games/game-pinyin-from-chars.js';
import { startPinyinFromDigits } from './games/game-pinyin-from-digits.js';
import { openSettings } from './settings.js';

let currentScreen = null;

/**
 * Navegación SPA simple
 */
export function initRouter() {
  navigate('menu');
}

export function navigate(screen) {
  currentScreen = screen;
  const view = document.querySelector('#view');
  view.innerHTML = '';

  switch (screen) {
    case 'menu':
      renderMenu();
      break;
    case 'recognition':
      startRecognition();
      break;
    case 'reverse':
      startReverse();
      break;
    case 'pinyinChars':
      startPinyinFromChars();
      break;
    case 'pinyinDigits':
      startPinyinFromDigits();
      break;
    case 'settings':
      openSettings();
      break;
    default:
      renderMenu();
      break;
  }
}
