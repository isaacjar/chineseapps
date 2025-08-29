// game-pinyin-from-digits.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { pinyinFromNumber } from '../chinese.js';
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
  // número correcto
  const num = sample(game.range, 1)[0];
  const correct = pinyinFromNumber(num);

  // pool de opciones en pinyin
  const pool = game.range.map(n => pinyinFromNumber(n));

  game.showQuestion({
    text: num.toString(), // mostramos el número en dígitos
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
