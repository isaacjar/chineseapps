// learning.js
import { loadState, getSettings, getSession } from './state.js';
import { setLang } from './i18n.js';              // ⬅️ corregido: antes era setLanguage
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
  if (s.language) {
    setLang(s.language);   // ⬅️ corregido: antes setLanguage
  }

  // renderizar HUD inicial con sesión actual
  updateHUD(getSession());

  // inicializar router
  initRouter();

  // botón de settings en header
  const btn = document.querySelector('#btn-open-settings');
  if (btn) {
    btn.addEventListener('click', () => {
      openSettings();
    });
  }
}

// arranque automático cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  startApp();
});
