// game-pinyin-from-digits.js
import { startGame } from './game-session.js';
import { renderOptions, generateOptions } from './game-helpers.js';
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
  const options = generateOptions(correct, pool);

  game.showQuestion({
    text: num.toString(),
    onRender(container) {
      renderOptions(container, options, choice => {
        if (choice === correct) {
          game.correct();
        } else {
          game.wrong();
        }
      });
    }
  });
}
