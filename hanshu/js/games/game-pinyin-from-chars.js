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
