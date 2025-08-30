// game-pinyin-from-chars.js
import { startGame } from './game-session.js';
import { getRandomPinyinFromCharsQuestion } from './game-helpers.js';

export function startPinyinFromChars() {
  startGame({
    id: 'pinyinChars',
    title: 'Pinyin desde caracteres',
    onQuestion: ({ correct, wrong }) => {
      const question = getRandomPinyinFromCharsQuestion();
      const view = document.querySelector('#view');

      view.innerHTML = `
        <div class="question">${question.prompt}</div>
        <div id="options-root"></div>
      `;

      const container = view.querySelector('#options-root');
      renderOptions(container, question.options, (opt) => {
        if (opt === question.answer) {
          correct();
        } else {
          wrong();
        }
      });
    }
  });
}
