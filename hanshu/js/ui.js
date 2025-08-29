// ui.js
import { t } from './i18n.js';

// ======= HUD =======
export function renderHUD(session) {
  const hud = document.querySelector('#hud');
  hud.innerHTML = `
    <div class="hud-item" id="hud-language">${session.language}</div>
    <div class="hud-item">${t('ui.score')}: <span id="hud-score">${session.score}</span></div>
    <div class="hud-item">${t('ui.errors')}: <span id="hud-errors">${session.errors}</span></div>
    <div class="hud-item">${t('ui.time')}: <span id="hud-time">${session.time}</span></div>
    <button id="btn-open-settings" class="btn">⚙️</button>
  `;
}

// actualizar HUD con animación
export function updateHUD({ score, errors, time }) {
  if (score !== undefined) {
    $('#hud-score').fadeOut(100).text(score).fadeIn(100);
  }
  if (errors !== undefined) {
    $('#hud-errors').fadeOut(100).text(errors).fadeIn(100);
  }
  if (time !== undefined) {
    $('#hud-time').fadeOut(100).text(time).fadeIn(100);
  }
}

// ======= Toasts =======
export function showToast(msg, type = 'info') {
  const container = document.querySelector('#toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  // animación con jQuery
  $(toast).hide().fadeIn(200).delay(2000).fadeOut(400, function () {
    $(this).remove();
  });
}

// ======= Modal =======
export function showModal(content, onOpen) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML = content;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // animación con jQuery
  $(overlay).hide().fadeIn(200);
  $(box).hide().slideDown(250);

  if (onOpen) onOpen();
}

export function closeModal() {
  $('#modal-overlay').fadeOut(200, function () {
    $(this).remove();
  });
}

// ======= Navegación suave entre pantallas =======
export function smoothNavigate(renderFn) {
  const view = $('#view');
  view.fadeOut(200, () => {
    view.empty();
    renderFn();
    view.fadeIn(200);
  });
}
