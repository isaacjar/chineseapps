// game-reverse.js
import { startGame } from './game-session.js';
import { getRandomReverseQuestion, renderOptions } from './game-helpers.js';

export function startReverse() {
  startGame({
    id: 'reverse',
    title: 'Reverse',
    onQuestion: ({ correct, wrong }) => {
      const question = getRandomReverseQuestion();
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
