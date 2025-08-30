// learning.js
import { loadState, getSettings, getSession } from './state.js';
import { setLang } from './i18n.js';
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
  setLang(s.language);

  // renderizar HUD inicial
  renderHUD(getSession());

  // inicializar router (gestiona hash y navegación)
  initRouter();

	// Fuerza menú al pulsar logo
	const brand = document.querySelector('.brand-link');
	if (brand) {
	  brand.addEventListener('click', (e) => {
		e.preventDefault();
		navigate('menu');   // 👈 fuerza la navegación al menú
	  });
	}

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
