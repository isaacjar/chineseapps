// game-pinyin-from-chars.js
import { startGame } from './game-session.js';
import { generateOptions, renderOptions } from './game-helpers.js';
import { chineseFromNumber, pinyinFromNumber } from '../chinese.js';
import { rngSample } from '../rng.js';
import { t } from '../i18n.js';

export function startPinyinFromChars() {
  startGame({
    id: 'pinyinChars',
    title: t('menu.pinyinChars'),
    onQuestion
  });
}

function onQuestion(game) {
  // número correcto
  const num = rngSample(game.range, 1)[0];
  const correct = pinyinFromNumber(num);

  // pool de opciones en pinyin
  const pool = game.range.map(pinyinFromNumber);
  const options = generateOptions(correct, pool);

  game.showQuestion({
    text: chineseFromNumber(num), // mostramos el carácter chino
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
