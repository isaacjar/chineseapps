// game-session.js
import { renderHUD } from '../ui.js';
import { getSettings, getSession, setSession } from '../state.js';
import { navigate } from '../router.js';

/**
 * Inicia una sesión de juego
 * @param {Object} config
 * @param {string} config.id - id del juego (ej. "recognition")
 * @param {string} config.title - título del juego
 * @param {Function} config.onQuestion - callback que genera cada pregunta
 */
export function startGame(config) {
  const settings = getSettings();

  // estado inicial de la sesión
  const session = {
    id: config.id,
    title: config.title,
    score: 0,
    streak: 0,
    lives: settings.fails || 3,
    questions: 0,
    correct: 0,
    range: buildRange(settings.range)
  };

  setSession(session);
  renderHUD(session);

  const view = document.querySelector('#view');
  view.innerHTML = `
    <section class="game-shell">
      <h2 class="game-title">${config.title}</h2>
      <div class="game-root" id="game-root"></div>
    </section>
  `;

  nextQuestion(config);
}

/**
 * Genera la siguiente pregunta
 */
function nextQuestion(config) {
  const session = getSession();
  session.questions++;
  setSession(session);

  const root = document.querySelector('#game-root');
  root.innerHTML = '';

  config.onQuestion({
    range: session.range,
    correct: () => {
      session.score += 10;
      session.streak++;
      session.correct++;
      setSession(session);
      renderHUD(session);
      nextQuestion(config);
    },
    wrong: () => {
      session.lives--;
      session.streak = 0;
      setSession(session);
      renderHUD(session);

      if (session.lives > 0) {
        nextQuestion(config);
      } else {
        showGameOver(session, config);
      }
    },
    showQuestion({ text, onRender }) {
      root.innerHTML = `
        <div class="question">${text}</div>
        <div class="options" id="options"></div>
      `;
      const container = root.querySelector('#options');
      onRender(container);
    }
  });
}

/**
 * Construye rango de números según settings
 */
function buildRange(rangeKey) {
  switch (rangeKey) {
    case 'r1_10':
      return Array.from({ length: 10 }, (_, i) => i + 1);
    case 'r11_99':
      return Array.from({ length: 89 }, (_, i) => i + 11);
    case 'r100_999':
      return Array.from({ length: 900 }, (_, i) => i + 100);
    case 'r1000_9999':
      return Array.from({ length: 9000 }, (_, i) => i + 1000);
    case 'r10000_9999999':
      return Array.from({ length: 9999999 - 9999 }, (_, i) => i + 10000);
    default:
      return Array.from({ length: 10 }, (_, i) => i + 1);
  }
}

/**
 * Pantalla de fin de juego
 */
function showGameOver(session, config) {
  const root = document.querySelector('#game-root');
  root.innerHTML = `
    <div class="end-screen">
      <h2>💀 Game Over</h2>
      <p>Score: ${session.score}</p>
      <p>Correct answers: ${session.correct}/${session.questions}</p>
      <button id="btn-retry" class="btn">🔄 Try Again</button>
      <button id="btn-menu" class="btn btn-secondary">🏠 Menu</button>
    </div>
  `;

  document.querySelector('#btn-retry').addEventListener('click', () => {
    startGame(config);
  });
  document.querySelector('#btn-menu').addEventListener('click', () => {
    navigate('menu');
  });
}
