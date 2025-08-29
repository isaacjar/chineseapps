// game-recognition.js
import { startGame } from './game-session.js';
import { generateOptions, renderOptions } from './game-helpers.js';
import { chineseFromNumber } from '../chinese.js';
import { rngSample } from '../rng.js';
import { t } from '../i18n.js';

export function startRecognition() {
  startGame({
    id: 'recognition',
    title: t('menu.recognition'),
    onQuestion
  });
}

function onQuestion(game) {
  // número correcto
  const num = rngSample(game.range, 1)[0];
  const correct = num.toString();

  // pool de opciones en dígitos
  const pool = game.range.map(n => n.toString());
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
