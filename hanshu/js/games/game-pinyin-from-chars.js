// game-pinyin-from-chars.js
import { startGame } from './game-session.js';
import { renderOptions, generateOptions } from './game-helpers.js';
import { chineseFromNumber, chinesePinyin } from '../chinese.js';
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
  const correct = chinesePinyin(num);

  // pool de opciones (pinyin)
  const pool = game.range.map(n => chinesePinyin(n));
  const options = generateOptions(correct, pool);

  game.showQuestion({
    text: chineseFromNumber(num), // mostramos caracteres chinos
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
