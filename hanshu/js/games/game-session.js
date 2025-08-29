// game-session.js
import { getSettings, getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';   // 🔹 antes renderHUD
import { t } from '../i18n.js';

/**
 * Inicia un juego genérico
 * @param {Object} config
 * @param {string} config.id - ID del juego
 * @param {string} config.title - Título
 * @param {Function} config.onQuestion - Generador de preguntas
 */
export function startGame(config) {
  const settings = getSettings();
  const session = {
    id: config.id,
    title: config.title,
    range: buildRange(settings.range),
    qcount: settings.qcount,
    qtime: settings.qtime,
    lives: settings.fails,
    score: 0,
    streak: 0,
    asked: 0,
    onQuestion: config.onQuestion
  };

  setSession(session);
  updateHUD(session);   // 🔹 antes renderHUD

  showNextQuestion();
}

/**
 * Construye rango de números según configuración
 */
function buildRange(rangeKey) {
  switch (rangeKey) {
    case 'r1_10': return Array.from({ length: 10 }, (_, i) => i + 1);
    case 'r11_99': return Array.from({ length: 89 }, (_, i) => i + 11);
    case 'r100_999': return Array.from({ length: 900 }, (_, i) => i + 100);
    case 'r1000_9999': return Array.from({ length: 9000 }, (_, i) => i + 1000);
    case 'r10000_9999999': return Array.from({ length: 9999999 - 9999 }, (_, i) => i + 10000);
    default: return Array.from({ length: 10 }, (_, i) => i + 1);
  }
}

/**
 * Muestra la siguiente pregunta o finaliza el juego
 */
function showNextQuestion() {
  const session = getSession();
  const view = document.querySelector('#view');
  view.innerHTML = `
    <section class="game-shell">
      <h2 class="game-title">${session.title}</h2>
      <div id="game-root" class="game-root"></div>
    </section>
  `;

  if (session.asked >= session.qcount || session.lives <= 0) {
    return showGameOver();
  }

  session.asked++;
  setSession(session);

  session.onQuestion({
    range: session.range,
    showQuestion: ({ text, onRender }) => {
      const root = document.querySelector('#game-root');
      root.innerHTML = `
        <div class="question">${text}</div>
      `;
      onRender(root);
    },
    correct: () => {
      session.score += 10;
      session.streak++;
      setSession(session);
      updateHUD(session);   // 🔹 antes renderHUD
      showNextQuestion();
    },
    wrong: () => {
      session.streak = 0;
      session.lives--;
      setSession(session);
      updateHUD(session);   // 🔹 antes renderHUD
      showNextQuestion();
    }
  });
}

/**
 * Pantalla final del juego
 */
function showGameOver() {
  const session = getSession();
  const view = document.querySelector('#view');
  view.innerHTML = `
    <section class="end-screen">
      <h2>${t('ui.gameOver')}</h2>
      <p>${t('ui.finalScore')}: ${session.score}</p>
      <button id="restart" class="btn">${t('ui.restart')}</button>
      <button id="back" class="btn btn-secondary">${t('ui.backMenu')}</button>
    </section>
  `;

  document.querySelector('#restart').addEventListener('click', () => {
    startGame({
      id: session.id,
      title: session.title,
      onQuestion: session.onQuestion
    });
  });

  document.querySelector('#back').addEventListener('click', () => {
    import('../router.js').then(m => m.navigate('menu'));
  });
}
