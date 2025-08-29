// game-recognition.js
import { gameShell } from './game-helpers.js';
import { newSession, getSession, loseLife, getSettings } from '../state.js';
import { getRandomNumber } from '../settings.js';
import { scoreCorrect, scoreWrong } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { createTimer } from '../timer.js';
import { chineseChar, chineseDistractors } from '../chinese.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';

export function startRecognition() {
  const { root, showEnd } = gameShell(t('menu.recognition'));
  const s = newSession();

  nextQuestion();

  function nextQuestion() {
    if (s.lives <= 0 || s.question >= getSettings().qcount) {
      return showEnd(s);
    }

    s.question++;
    const num = getRandomNumber(getSettings().range);
    const correct = chineseChar(num);
    const distractors = chineseDistractors(num, 3);
    const options = shuffle([correct, ...distractors]);

    root.innerHTML = `
      <p class="question">${num}</p>
      <div class="options">
        ${options.map(o => `<button class="btn option">${o}</button>`).join('')}
      </div>
      <div id="hud-timer"></div>
    `;

    // iniciar temporizador
    const timer = createTimer(
      root.querySelector('#hud-timer'),
      getSettings().qtime,
      () => handleAnswer(null, num, correct, timer)
    );

    root.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        handleAnswer(btn.textContent, num, correct, timer);
      });
    });
  }

  function handleAnswer(choice, num, correct, timer) {
    timer.stop();
    if (choice === correct) {
      const pts = scoreCorrect(timer.timeLeft, getSettings().qtime);
      toast(`+${pts} ${t('ui.correct')}`, 'good');
    } else {
      scoreWrong();
      loseLife();
      toast(`✘ ${num} = ${correct}`, 'warn');
    }
    updateHUD();
    setTimeout(nextQuestion, 1000);
  }
}
