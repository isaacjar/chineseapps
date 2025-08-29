// game-pinyin-from-digits.js
import { startGame } from './game-session.js';
import { generateOptions, renderOptions } from './game-helpers.js';
import { chinesePinyin } from '../chinese.js';
import { rngSample } from '../rng.js';
import { t } from '../i18n.js';

export function startPinyinFromDigits() {
  startGame({
    id: 'pinyinDigits',
    title: t('menu.pinyinDigits'),
    onQuestion
  });
}

function onQuestion(game) {
  // número correcto
  const num = rngSample(game.range, 1)[0];
  const correct = chinesePinyin(num);

  // pool de opciones en pinyin
  const pool = game.range.map(n => chinesePinyin(n));
  const options = generateOptions(correct, pool, game.difficulty);

  game.showQuestion({
    text: num.toString(), // mostramos el número en dígitos
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
