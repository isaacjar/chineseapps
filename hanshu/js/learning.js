// learning.js
import { loadState, getSettings, getSession } from './state.js';
import { setLanguage } from './i18n.js';
import { initRouter, navigate } from './router.js';
import { openSettings, initSettingsTrigger } from './settings.js';
import { renderHUD } from './ui.js';

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
  renderHUD(getSession());

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
  initSettingsTrigger(); // 👈 aquí enganchas el click al hud-language
});

window.addEventListener('hashchange', () => {
  const screen = location.hash.replace('#', '') || 'menu';
  navigate(screen);
});