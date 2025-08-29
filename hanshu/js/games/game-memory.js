// games/game-memory.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';
import { addScore, penalize } from '../score.js';
import { t } from '../i18n.js';

export function startMemory() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="game memory">
      <h2>${t('games.memoryShow')}</h2>
      <div id="memory-sequence"></div>
      <input id="memory-answer" class="input" />
      <button id="memory-submit" class="btn">${t('ui.confirm')}</button>
    </div>
  `;

  const sequence = [1, 2, 3];
  document.getElementById('memory-sequence').textContent = sequence.join(' ');

  document.getElementById('memory-submit').addEventListener('click', () => {
    const answer = document.getElementById('memory-answer').value.trim().split(/\s+/);
    const session = getSession();

    if (answer.join(',') === sequence.join(',')) {
      addScore(30, 0);
    } else {
      penalize();
    }

    setSession(session);
    updateHUD(session);
  });
}
