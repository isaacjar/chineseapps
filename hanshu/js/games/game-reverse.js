// game-reverse.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
import { chineseChar } from '../chinese.js';
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
  const num = sample(game.range, 1)[0];
  const correct = chineseChar(num);

  const pool = game.range.map(n => chineseChar(n));

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
