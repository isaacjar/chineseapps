// game-helpers.js
import { renderHUD } from '../ui.js';
import { getSession } from '../state.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';

/**
 * Prepara layout base de un juego dentro de #view.
 * 
 * @param {string} title - título del juego
 * @returns {{ root: HTMLElement, showEnd: Function }}
 */
export function gameShell(title) {
  const view = document.querySelector('#view');
  view.innerHTML = `
    <section class="game-shell">
      <h2 class="game-title">${title}</h2>
      <div id="game-root" class="game-root"></div>
      <div class="game-actions">
        <button class="btn-exit">⏹ ${t('ui.exit')}</button>
      </div>
    </section>
  `;

  const root = document.querySelector('#game-root');
  const exitBtn = view.querySelector('.btn-exit');

  exitBtn.addEventListener('click', () => {
    navigate('menu');
  });

  // actualizar HUD global al inicio
  renderHUD(getSession());

  return {
    root,
    showEnd: (session) => showEnd(session)
  };
}

/**
 * Pantalla final de fin de partida
 */
function showEnd(session) {
  const root = document.querySelector('#game-root');
  root.innerHTML = `
    <div class="end-screen">
      <h2>${t('ui.gameOver')}</h2>
      <p>${t('ui.finalScore')}: ⭐ ${session.score}</p>
      <button class="btn" id="back-menu">🏠 ${t('ui.backMenu')}</button>
    </div>
  `;

  root.querySelector('#back-menu').addEventListener('click', () => {
    navigate('menu');
  });
}
