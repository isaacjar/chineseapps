// game-pinyin-from-digits.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { chinesePinyin } from '../chinese.js';
import { sample } from '../rng.js';
import { t } from '../i18n.js';

export function startPinyinFromDigits() {
  startGame({
    id: 'pinyinDigits',
    title: t('menu.pinyinDigits'),
    onQuestion
  });
}

function onQuestion(game) {
  const num = sample(game.range, 1)[0];
  const correct = chinesePinyin(num);

  const pool = game.range.map(n => chinesePinyin(n));

  game.showQuestion({
    text: num.toString(), // mostramos número en dígitos
    onRender(container) {
      const optsEl = renderOptions(pool, correct, (isCorrect) => {
        isCorrect ? game.correct() : game.wrong();
      });
      container.appendChild(optsEl);
    }
  });
}
