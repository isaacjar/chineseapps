// games/game-recognition.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';
import { addScore, penalize } from '../score.js';
import { t } from '../i18n.js';

export function startRecognition() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="game recognition">
      <h2>${t('games.recognitionPrompt')}</h2>
      <div id="recognition-question"></div>
      <input id="recognition-answer" class="input" />
      <button id="recognition-submit" class="btn">${t('ui.confirm')}</button>
    </div>
  `;

  // Demo: generar número aleatorio
  const number = Math.floor(Math.random() * 99) + 1;
  document.getElementById('recognition-question').textContent = number;

  document.getElementById('recognition-submit').addEventListener('click', () => {
    const answer = document.getElementById('recognition-answer').value.trim();
    const session = getSession();

    if (answer === String(number)) {
      addScore(10, 0);
    } else {
      penalize();
    }

    setSession(session);
    updateHUD(session);
  });
}
