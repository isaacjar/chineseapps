// game-pinyin-from-chars.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { chineseChar, chinesePinyin } from '../chinese.js';
import { sample } from '../rng.js';
import { t } from '../i18n.js';

export function startPinyinFromChars() {
  startGame({
    id: 'pinyinChars',
    title: t('menu.pinyinChars'),
    onQuestion
  });
}

function onQuestion(game) {
  const num = sample(game.range, 1)[0];
  const correct = chinesePinyin(num);

  const pool = game.range.map(n => chinesePinyin(n));

  game.showQuestion({
    text: chineseChar(num), // mostramos caracteres chinos
    onRender(container) {
      const optsEl = renderOptions(pool, correct, (isCorrect) => {
        isCorrect ? game.correct() : game.wrong();
      });
      container.appendChild(optsEl);
    }
  });
}
