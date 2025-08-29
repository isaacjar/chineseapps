// learning.js
import { loadState, getSettings, getSession } from './state.js';
import { setLanguage } from './i18n.js';
import { initRouter } from './router.js';
import { openSettings } from './settings.js';
import { updateHUD } from './ui.js';

/**
 * Punto de entrada de la app
 */
export function startApp() {
  // cargar estado y settings guardados
  loadState();
  const s = getSettings();

  // aplicar idioma inicial
  setLanguage(s.language);

  // renderizar HUD inicial con sesión actual
  updateHUD(getSession());

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
