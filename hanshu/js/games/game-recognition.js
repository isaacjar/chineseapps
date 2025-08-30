// game-recognition.js
import { startGame } from './game-session.js';
import { getRandomQuestion, renderOptions } from './game-helpers.js';

export function startRecognition() {
  startGame({
    id: 'recognition',
    title: 'Reconocimiento',
    onQuestion: ({ correct, wrong }) => {
      const question = getRandomQuestion();
      const view = document.querySelector('#view');

      view.innerHTML = `
        <div class="question">${question.prompt}</div>
        <div id="options-root"></div>
      `;

      const container = view.querySelector('#options-root');
      // usar renderOptions para aplicar .options-container + cols-2/cols-3
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
