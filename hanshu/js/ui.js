// ui.js
import { getSession, getSettings, setSettings } from './state.js';
import { t, setLang, getLang } from './i18n.js';

/**
 * Actualiza el HUD global en el header
 */
export function renderHUD(session = getSession()) {
  document.querySelector('#hud-score').textContent = `🏅 ${session.score}`;
  document.querySelector('#hud-streak').textContent = `🔥 ${session.streak}`;
  document.querySelector('#hud-lives').textContent = `❤️ ${session.lives}`;
  document.querySelector('#hud-language').textContent = `🌎 ${getLang().toUpperCase()}`;
}

/**
 * Toasts (notificaciones cortas)
 */
export function toast(message, type = 'info') {
  const container = document.querySelector('#toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    el.addEventListener('transitionend', () => el.remove());
  }, 2000);
}

/**
 * Modal simple
 * @param {string} content - contenido HTML del modal
 * @param {Function} onClose - callback al cerrar
 */
export function showModal(content, onClose) {
  const root = document.querySelector('#modal-root');
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        ${content}
        <div class="modal-actions">
          <button class="btn btn-exit" id="modal-close">${t('ui.close')}</button>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#modal-close').addEventListener('click', () => {
    closeModal();
    if (onClose) onClose();
  });
}

export function closeModal() {
  const root = document.querySelector('#modal-root');
  root.innerHTML = '';
}
