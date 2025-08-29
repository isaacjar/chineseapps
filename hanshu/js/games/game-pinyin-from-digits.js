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
