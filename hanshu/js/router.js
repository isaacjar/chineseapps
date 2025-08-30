// router.js
import { renderMenu } from './menu.js';
import { startRecognition } from './games/game-recognition.js';
import { startReverse } from './games/game-reverse.js';
import { startPinyinFromChars } from './games/game-pinyin-from-chars.js';
import { startPinyinFromDigits } from './games/game-pinyin-from-digits.js';
import { openSettings } from './settings.js';
import { smoothNavigate } from './ui.js';

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
 * Inicializa el router y escucha cambios de hash
 */
export function initRouter() {
  // primera navegación
  navigateFromHash();

  // re-navegar cuando cambia el hash
  window.addEventListener('hashchange', navigateFromHash);
}

/**
 * Navegar según el hash actual
 */
function navigateFromHash() {
  const screen = location.hash.replace('#', '') || 'menu';
  navigate(screen);
}

/* Pantallas Menu y Juego */
export let currentScreen = 'menu';
export function navigate(screen) {
  currentScreen = screen;
  const action = routes[screen] || routes['menu'];
  smoothNavigate(action);
}
