// router.js
import { renderMenu } from './menu.js';
import { startRecognition } from './game-recognition.js';
import { startReverse } from './game-reverse.js';
import { startPinyinFromChars } from './game-pinyin-from-chars.js';
import { startPinyinFromDigits } from './game-pinyin-from-digits.js';
import { startMemory } from './game-memory.js';
import { openSettings } from './settings.js';

/**
 * Navegación simple SPA por hash
 */
export function navigate(screen) {
  window.location.hash = screen;
  render(screen);
}

export function initRouter() {
  window.addEventListener('hashchange', () => {
    render(window.location.hash.slice(1));
  });

  // carga inicial
  render(window.location.hash.slice(1) || 'menu');
}

function render(screen) {
  switch (screen) {
    case 'menu': renderMenu(); break;
    case 'recognition': startRecognition(); break;
    case 'reverse': startReverse(); break;
    case 'pinyinChars': startPinyinFromChars(); break;
    case 'pinyinDigits': startPinyinFromDigits(); break;
    case 'memory': startMemory(); break;
    case 'settings': openSettings(); break;
    default: renderMenu();
  }
}
