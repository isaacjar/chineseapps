import { getSession, getSettings, addCorrect } from '../state.js';
import { randomNumberIn, numberToChinese, digitDistractors } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';

export class GameSession {
  constructor(root, shell) {
    this.root = root;
    this.shell = shell;
    this.timer = null;

    // Banderas separadas para evitar conflictos
    this.nextInProgress = false;
    this.questionCompleted = false;

    window.addEventListener('go-next', () => this.next());
  }

  start() {
    const sess = getSession();
    if (sess.current === 0 && sess.correct === 0) {
      this.next();
    }
  }

  next() {
	  if (this.nextInProgress) return;
	  this.nextInProgress = true;

	  incQuestion(); // 👈 ahora controlado aquí
	  this.shell.next();
	}


  resetTrigger() {
    this.nextInProgress = false;
    this.questionCompleted = false;
  }

  renderQuestion() {
    this.resetTrigger();

    const s = getSettings();
    const n = randomNumberIn(s.range);
    const cn = numberToChinese(n);
    const options = shuffle([n, ...digitDistractors(n, 3)]);

    const promptEl = this.root.querySelector('#prompt');
    if (promptEl) {
      promptEl.innerHTML = `<span class="cn-text">${cn}</span>`;
    }

    const elOptions = this.root.querySelector('#options');
    elOptions.innerHTML = '';
    this.root.querySelector('#answer-input').style.display = 'none';

    elOptions.style.display = 'grid';
    elOptions.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    elOptions.style.gap = '12px';

    options.forEach(opt => {
      const el = document.createElement('button');
      el.className = 'option';
      el.innerHTML = `<span>${opt}</span>`;
      el.addEventListener('click', () => this.choose(opt, n));
      elOptions.appendChild(el);
    });

    const slot = this.root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if (this.timer) this.timer.stop();
    this.timer = createTimer(
      s.timePerQuestion,
      (left, total) => paint(left, total),
      () => {
        penalize();
        toast('⏳ ' + t('ui.outOfTime'), 'warn');
        this.endCheck();
      }
    );
  }

  choose(opt, correct) {
    const s = getSettings();
    const elOptions = this.root.querySelectorAll('.option');
    elOptions.forEach(b => b.disabled = true);

    if (this.timer) this.timer.stop();
    const timeLeft = this.timer?.timeLeft();

    if (opt === correct) {
      const pts = scoreCorrect(timeLeft ?? 0, s.timePerQuestion);
      addCorrect();
      toast(`✅ +${pts} 🏅`, 'good');
    } else {
      penalize();
      toast('❌', 'warn');
    }

    this.endCheck();
  }

  endCheck() {
    if (this.questionCompleted) return;
    this.questionCompleted = true;

    const sess = getSession();
    updateHUD(sess);

    setTimeout(() => {
      if (sess.lives <= 0 || sess.current >= sess.total) {
        this.showEnd();
      } else {
        window.dispatchEvent(new CustomEvent('go-next'));
      }
    }, 600);
  }

  showEnd() {
    const sess = getSession();
    const finalScore = sess.score ?? 0;
    const totalQuestions = sess.total ?? 0;
    const correctAnswers = sess.correct ?? 0;

    this.root.innerHTML = `
      <div class="game-over" style="text-align: center; padding: 40px;">
        <h2 style="font-size: 2em; margin-bottom: 20px;">🎉 ${t('ui.gameOver') || 'Game Over'}</h2>
        <p style="font-size: 1.2em;">${t('ui.finalScore') || 'Final Score'}: <strong>${finalScore}</strong></p>
        <p>${t('ui.correctAnswers') || 'Correct Answers'}: ${correctAnswers} / ${totalQuestions}</p>
        <button style="margin-top: 30px; font-size: 1em;" onclick="location.reload()">🔄 ${t('ui.restart') || 'Restart'}</button>
      </div>
    `;
  }

  getProgress() {
    return getSession();
  }
}
