// games/game-pinyin-from-chars.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';
import { addScore, penalize } from '../score.js';
import { t } from '../i18n.js';

export function startPinyinFromChars() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="game pinyin-chars">
      <h2>${t('games.pinyinCharsPrompt')}</h2>
      <div id="pinyin-question"></div>
      <input id="pinyin-answer" class="input" />
      <button id="pinyin-submit" class="btn">${t('ui.confirm')}</button>
    </div>
  `;

  // TODO: cargar caracteres reales desde chinese.js
  const correct = 'yi';
  document.getElementById('pinyin-question').textContent = '一';

  document.getElementById('pinyin-submit').addEventListener('click', () => {
    const answer = document.getElementById('pinyin-answer').value.trim();
    const session = getSession();

    if (answer.toLowerCase() === correct) {
      addScore(20, 0);
    } else {
      penalize();
    }

    setSession(session);
    updateHUD(session);
  });
}
