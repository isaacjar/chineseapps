// game-pinyin-from-digits.js
import { startGame } from './game-session.js';
import { getRandomPinyinFromDigitsQuestion } from './game-helpers.js';

export function startPinyinFromDigits() {
  startGame({
    id: 'pinyinDigits',
    title: 'Pinyin desde dígitos',
    onQuestion: ({ correct, wrong }) => {
      const question = getRandomPinyinFromDigitsQuestion();
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
