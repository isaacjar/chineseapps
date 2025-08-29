// game-reverse.js
import { gameShell } from './game-helpers.js';
import { newSession, getSession, loseLife, getSettings } from './state.js';
import { getRandomNumber } from './settings.js';
import { scoreCorrect, scoreWrong } from './score.js';
import { updateHUD, toast } from './ui.js';
import { createTimer } from './timer.js';
import { chineseChar } from './chinese.js';
import { randInt, shuffle } from './rng.js';
import { t } from './i18n.js';

export function startReverse() {
  const { root, showEnd } = gameShell(t('menu.reverse'));
  const s = newSession();

  nextQuestion();

  function nextQuestion() {
    if (s.lives <= 0 || s.question >= getSettings().qcount) {
      return showEnd(s);
    }

    s.question++;
    const num = getRandomNumber(getSettings().range);
    const char = chineseChar(num);

    // generar distractores cercanos
    const distractors = [];
    while (distractors.length < 3) {
      const d = num + randInt(-20, 20);
      if (d > 0 && d !== num && !distractors.includes(d)) {
        distractors.push(d);
      }
    }

    const options = shuffle([num, ...distractors]);

    root.innerHTML = `
      <p class="question big">${char}</p>
      <div class="options">
        ${options.map(o => `<button class="btn option">${o}</button>`).join('')}
      </div>
      <div id="hud-timer"></div>
    `;

    // iniciar temporizador
    const timer = createTimer(
      root.querySelector('#hud-timer'),
      getSettings().qtime,
      () => handleAnswer(null, num, timer)
    );

    root.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        handleAnswer(parseInt(btn.textContent), num, timer);
      });
    });
  }

  function handleAnswer(choice, correct, timer) {
    timer.stop();
    if (choice === correct) {
      const pts = scoreCorrect(timer.timeLeft, getSettings().qtime);
      toast(`+${pts} ${t('ui.correct')}`, 'good');
    } else {
      scoreWrong();
      loseLife();
      toast(`✘ ${chineseChar(correct)} = ${correct}`, 'warn');
    }
    updateHUD();
    setTimeout(nextQuestion, 1000);
  }
}
