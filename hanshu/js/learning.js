// learning.js
import { loadState, getSettings, getSession } from './state.js';
import { setLanguage } from './i18n.js';
import { initRouter } from './router.js';
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

  // renderizar HUD inicial
  renderHUD(getSession());

  // inicializar router (gestiona hash y navegación)
  initRouter();

  // botón de settings en header
  const btnSettings = document.querySelector('#btn-open-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      openSettings();
    });
  }

  // activar trigger en HUD (idioma)
  initSettingsTrigger();
}

// arranque automático cuando el DOM está listo
document.addEventListener('DOMContentLoaded', startApp);
