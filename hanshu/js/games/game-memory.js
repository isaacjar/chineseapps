// game-memory.js
import { gameShell } from './game-helpers.js';
import { newSession, getSession, loseLife, getSettings } from './state.js';
import { scoreCorrect, scoreWrong } from './score.js';
import { updateHUD, toast } from './ui.js';
import { chineseChar } from './chinese.js';
import { randInt } from './rng.js';
import { t } from './i18n.js';

export function startMemory() {
  const { root, showEnd } = gameShell(t('menu.memory'));
  const s = newSession();

  let sequence = [];
  let playerInput = [];

  nextRound();

  function nextRound() {
    if (s.lives <= 0 || s.question >= getSettings().qcount) {
      return showEnd(s);
    }

    s.question++;
    sequence.push(randInt(1, 9)); // añadir un dígito nuevo (1–9)
    playerInput = [];

    showSequence(0);
  }

  function showSequence(index) {
    if (index >= sequence.length) {
      return promptPlayer();
    }

    root.innerHTML = `
      <p class="question big">${chineseChar(sequence[index])}</p>
    `;

    setTimeout(() => showSequence(index + 1), 1000);
  }

  function promptPlayer() {
    root.innerHTML = `
      <p class="question">${t('ui.repeatSequence')}</p>
      <div class="options">
        ${[1,2,3,4,5,6,7,8,9].map(
          n => `<button class="btn option" data-n="${n}">${chineseChar(n)}</button>`
        ).join('')}
      </div>
    `;

    root.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = parseInt(btn.dataset.n);
        handleInput(choice);
      });
    });
  }

  function handleInput(choice) {
    playerInput.push(choice);

    // comparar con secuencia esperada
    const expected = sequence[playerInput.length - 1];
    if (choice !== expected) {
      scoreWrong();
      loseLife();
      toast(`✘ ${t('ui.wrongSequence')}`, 'warn');
      updateHUD();
      sequence = []; // reiniciar secuencia
      return setTimeout(nextRound, 1000);
    }

    // si acertó hasta aquí y completó toda la secuencia
    if (playerInput.length === sequence.length) {
      const pts = scoreCorrect(5, 5); // puntaje fijo por ronda completada
      toast(`+${pts} ${t('ui.correctSequence')}`, 'good');
      updateHUD();
      return setTimeout(nextRound, 1000);
    }
  }
}
