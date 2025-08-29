// game-reverse.js
import { startGame } from './game-session.js';
import { renderOptions, generateOptions } from './game-helpers.js';
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
