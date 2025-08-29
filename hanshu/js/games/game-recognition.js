// game-recognition.js
import { startGame } from './game-session.js';
import { renderOptions, generateOptions } from './game-helpers.js';
import { chineseChar } from '../chinese.js';
import { sample } from '../rng.js';
import { t } from '../i18n.js';

export function startRecognition() {
  startGame({
    id: 'recognition',
    title: t('menu.recognition'),
    onQuestion
  });
}

function onQuestion(game) {
  const num = sample(game.range, 1)[0];
  const correct = num.toString();

  const pool = game.range.map(n => n.toString());
  const options = generateOptions(correct, pool);

  game.showQuestion({
    text: chineseChar(num),
    onRender(container) {
      renderOptions(container, options, choice => {
        choice === correct ? game.correct() : game.wrong();
      });
    }
  });
}
