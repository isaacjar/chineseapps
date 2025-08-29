// game-reverse.js
import { startGame } from './game-session.js';
import { generateOptions, renderOptions } from './game-helpers.js';
import { chineseFromNumber } from '../chinese.js';
import { rngSample } from '../rng.js';
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
  const num = rngSample(game.range, 1)[0];
  const correct = chineseFromNumber(num);

  // pool de opciones en caracteres chinos
  const pool = game.range.map(n => chineseFromNumber(n));
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
