// router.js
import { renderMenu } from './menu.js';
import { startRecognition } from './games/game-recognition.js';
import { startReverse } from './games/game-reverse.js';
import { startPinyinFromChars } from './games/game-pinyin-from-chars.js';
import { startPinyinFromDigits } from './games/game-pinyin-from-digits.js';
import { openSettings } from './settings.js';

let currentScreen = null;

// Mapeo de pantallas a funciones
const routes = {
  menu: renderMenu,
  recognition: startRecognition,
  reverse: startReverse,
  pinyinChars: startPinyinFromChars,
  pinyinDigits: startPinyinFromDigits,
  settings: openSettings
};

/**
 * Inicializa el router mostrando la pantalla según el hash actual
 */
export function initRouter() {
  const screen = location.hash.replace('#', '') || 'menu';
  navigate(screen);
}

/**
 * Navegación SPA simple
 * @param {string} screen - id de la pantalla
 */
export function navigate(screen) {
  currentScreen = screen;
  const view = document.querySelector('#view');
  view.innerHTML = '';

  const action = routes[screen] || routes['menu'];
  action();
}
