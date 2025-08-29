// game-pinyin-from-chars.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { chineseFromNumber, pinyinFromNumber } from '../chinese.js';
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
  // número correcto
  const num = sample(game.range, 1)[0];
  const correct = pinyinFromNumber(num);

  // pool de opciones en pinyin
  const pool = game.range.map(n => pinyinFromNumber(n));

  game.showQuestion({
    text: chineseFromNumber(num), // mostramos el carácter chino
    onRender(container) {
      // renderizamos opciones
      const optsEl = renderOptions(pool, correct, (isCorrect) => {
        if (isCorrect) {
          game.correct();
        } else {
          game.wrong();
        }
      });

      container.appendChild(optsEl);
    }
  });
}
