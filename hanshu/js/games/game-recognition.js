import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { GameSession } from './game-session.js';
import { t } from '../i18n.js';

register('game-recognition', (root) => {
  let session; // 👈 Declaramos antes para que esté disponible en el callback

  const shell = gameShell(root, {
    title: '视觉识别 • Visual',
    prompt: t('games.recognitionPrompt'),
    onRenderQuestion: () => session?.renderQuestion() // 👈 Usamos session cuando ya existe
  });

  session = new GameSession(root, shell);

  // Escucha el evento para avanzar a la siguiente pregunta
  window.addEventListener('go-next', () => session.next());

  // Inicia el juego si no hay progreso previo
  requestAnimationFrame(() => {
    const sess = session.getProgress();
    if (sess.current === 0 && sess.correct === 0) {
      session.next();
    }
  });
});
