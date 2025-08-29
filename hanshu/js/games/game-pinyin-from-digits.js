// games/game-pinyin-from-digits.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';
import { addScore, penalize } from '../score.js';
import { t } from '../i18n.js';

export function startPinyinFromDigits() {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="game pinyin-digits">
      <h2>${t('games.pinyinDigitsPrompt')}</h2>
      <div id="pinyin-digits-question"></div>
      <input id="pinyin-digits-answer" class="input" />
      <button id="pinyin-digits-submit" class="btn">${t('ui.confirm')}</button>
    </div>
  `;

  const number = 1;
  document.getElementById('pinyin-digits-question').textContent = number;

  document.getElementById('pinyin-digits-submit').addEventListener('click', () => {
    const answer = document.getElementById('pinyin-digits-answer').value.trim();
    const session = getSession();

    if (answer.toLowerCase() === 'yi') {
      addScore(20, 0);
    } else {
      penalize();
    }

    setSession(session);
    updateHUD(session);
  });
}
