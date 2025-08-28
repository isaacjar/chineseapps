import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { GameSession } from './game-session.js'; // 👈 nueva clase encapsulada
import { t } from '../i18n.js';

register('game-recognition', (root) => {
  const shell = gameShell(root, {
    title: '视觉识别 • Visual',
    prompt: t('games.recognitionPrompt'),
    onRenderQuestion: () => session.renderQuestion()
  });

  const session = new GameSession(root, shell);

  requestAnimationFrame(() => {
    const sess = session.getProgress();
    if (sess.current === 0 && sess.correct === 0) {
      session.next();
    }
  });

  window.addEventListener('go-next', () => session.next());
});
