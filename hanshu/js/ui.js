// ui.js
import { getSession } from './state.js';
import { t, getLang } from './i18n.js';

/**
 * Actualiza el HUD global en el header
 */
export function updateHUD(partial = {}) {
  const session = { ...getSession(), ...partial };

  const scoreEl = document.querySelector('#hud-score');
  const streakEl = document.querySelector('#hud-streak');
  const livesEl = document.querySelector('#hud-lives');
  const langEl = document.querySelector('#hud-language');

  if (scoreEl) scoreEl.textContent = `🏅 ${session.score}`;
  if (streakEl) streakEl.textContent = `🔥 ${session.streak}`;
  if (livesEl) livesEl.textContent = `❤️ ${session.lives}`;
  if (langEl) langEl.textContent = `🌎 ${getLang().toUpperCase()}`;
}

/**
 * Toasts (notificaciones cortas)
 */
export function toast(message, type = 'info') {
  let container = document.querySelector('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

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
 */
export function showModal(content, onClose) {
  const root = document.querySelector('#modal-root');
  root.innerHTML = `
    <div class="modal-overlay" role="dialog" aria-modal="true">
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
