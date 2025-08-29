// learning.js
import { loadSettings, getSettings } from './state.js';
import { setLanguage } from './i18n.js';
import { initRouter, navigate } from './router.js';
import { openSettings } from './settings.js';
import { updateHUD } from './ui.js';

/**
 * Punto de entrada de la app
 */
export function startApp() {
  // cargar settings guardados
  loadSettings();
  const s = getSettings();

  // aplicar idioma inicial
  setLanguage(s.language);

  // renderizar HUD inicial
  renderHUD();

  // inicializar router
  initRouter();

  // botón de settings en header
  document.querySelector('#btn-open-settings').addEventListener('click', () => {
    openSettings();
  });
}

// arranque automático cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  startApp();
});
