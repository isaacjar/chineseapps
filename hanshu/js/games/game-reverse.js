// game-reverse.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { chineseFromNumber } from '../chinese.js';
import { sample } from '../rng.js';
import { t } from '../i18n.js';

export function startReverse() {
  startGame({
    id: 'reverse',
    title: t('menu.reverse'),
    onQuestion
  });
}

function onQuestion(game) {
  // número correcto
  const num = sample(game.range, 1)[0];
  const correct = chineseFromNumber(num);

  // pool de opciones en caracteres chinos
  const pool = game.range.map(n => chineseFromNumber(n));

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
