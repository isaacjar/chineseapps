// games/game-reverse.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';
import { addScore, penalize } from '../score.js';
import { t } from '../i18n.js';

export function startReverse() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="game reverse">
      <h2>${t('games.reversePrompt')}</h2>
      <div id="reverse-question"></div>
      <input id="reverse-answer" class="input" />
      <button id="reverse-submit" class="btn">${t('ui.confirm')}</button>
    </div>
  `;

  const number = Math.floor(Math.random() * 99) + 1;
  document.getElementById('reverse-question').textContent = number;

  document.getElementById('reverse-submit').addEventListener('click', () => {
    const answer = document.getElementById('reverse-answer').value.trim();
    const session = getSession();

    if (answer === String(number)) {
      addScore(15, 0);
    } else {
      penalize();
    }

    setSession(session);
    updateHUD(session);
  });
}
