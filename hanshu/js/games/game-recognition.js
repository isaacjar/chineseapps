// game-recognition.js
import { startGame } from './game-session.js';
import { renderOptions } from './game-helpers.js';
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
  // número correcto
  const num = sample(game.range, 1)[0];
  const correct = num.toString();

  // pool de opciones en dígitos (string)
  const pool = game.range.map(n => n.toString());

  game.showQuestion({
    text: chineseChar(num), // mostramos caracteres chinos
    onRender(container) {
      const optsEl = renderOptions(pool, correct, (isCorrect) => {
        isCorrect ? game.correct() : game.wrong();
      });
      container.appendChild(optsEl);
    }
  });
}
