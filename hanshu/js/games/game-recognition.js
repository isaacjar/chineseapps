// game-recognition.js
import { startGame } from './game-session.js';
import { getRandomQuestion } from './game-helpers.js';

export function startRecognition() {
  startGame({
    id: 'recognition',
    title: 'Reconocimiento',
    onQuestion: ({ correct, wrong }) => {
      const question = getRandomQuestion();
      const view = document.querySelector('#view');

      view.innerHTML = `
        <div class="question">${question.prompt}</div>
        <div class="options">
          ${question.options.map(opt => `<button class="option">${opt}</button>`).join('')}
        </div>
      `;

      document.querySelectorAll('.option').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.textContent === question.answer) {
            correct();
          } else {
            wrong();
          }
        });
      });
    }
  });
}
