import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { getSession, getSettings, addCorrect } from '../state.js'; // 👈 importamos addCorrect
import { randomNumberIn, numberToChinese, digitDistractors } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';
let nextTriggered = false;

function safeNext() {
  if (nextTriggered) return;
  nextTriggered = true;
  shell.next();
}

register('game-recognition', (root) => {
  const shell = gameShell(root, {
    title: '视觉识别 • Visual',
    prompt: t('games.recognitionPrompt'),
    onRenderQuestion: renderQuestion
  });

  let timer = null;

  function renderQuestion(){
    nextTriggered = false;
	const s = getSettings();
    const n = randomNumberIn(s.range);
    const cn = numberToChinese(n);
    const options = shuffle([ n, ...digitDistractors(n, 3) ]);

    // Texto en chino centrado
    //root.querySelector('#prompt').innerHTML = `<span class="cn-text">${cn}</span>`;
	const promptEl = root.querySelector('#prompt');
	if (promptEl) {
	  promptEl.innerHTML = `<span class="cn-text">${cn}</span>`;
	}

    // Opciones
    const elOptions = root.querySelector('#options');
    elOptions.innerHTML = '';
    root.querySelector('#answer-input').style.display = 'none';

    // 📌 Usar grid adaptable para que haya varias columnas si hay espacio
    elOptions.style.display = 'grid';
    elOptions.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    elOptions.style.gap = '12px';

    options.forEach(opt => {
      const el = document.createElement('button');
      el.className = 'option';
      el.innerHTML = `<span>${opt}</span>`;
      el.addEventListener('click', ()=> choose(opt, n));
      elOptions.appendChild(el);
    });

    // Temporizador
    const slot = root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if(timer) timer.stop();
    timer = createTimer(s.timePerQuestion, (left,total)=> {
      paint(left,total);
    }, ()=>{
      penalize();
      toast('⏳ ' + t('ui.outOfTime'), 'warn');
      endCheck();
    });
  }

  function choose(opt, correct){
	  const s = getSettings();
	  const elOptions = root.querySelectorAll('.option');
	  elOptions.forEach(b => b.disabled = true);

	  if (timer) {
		timer.stop(); // 👈 detener antes de cualquier otra acción
	  }

	  let timeLeft = timer?.timeLeft();

	  if(opt === correct){
		const pts = scoreCorrect(timeLeft ?? 0, s.timePerQuestion);
		addCorrect();
		toast(`✅ +${pts} 🏅`, 'good');
	  } else {
		penalize();
		toast('❌', 'warn');
	  }

	  endCheck();
	}

  
  function endCheck(){
	  if (nextTriggered) return;
	  nextTriggered = true;

	  const sess = getSession();
	  updateHUD(sess);
	  setTimeout(() => {
		if(sess.lives <= 0 || sess.current >= sess.total){
		  showEnd();
		}else{
		  window.dispatchEvent(new CustomEvent('go-next'));
		}
	  }, 600);
	}

  function showEnd() {
    const sess = getSession();
    const finalScore = sess.score ?? 0;
    const totalQuestions = sess.total ?? 0;
    const correctAnswers = sess.correct ?? 0;

    root.innerHTML = `
      <div class="game-over" style="text-align: center; padding: 40px;">
        <h2 style="font-size: 2em; margin-bottom: 20px;">🎉 ${t('ui.gameOver') || 'Game Over'}</h2>
        <p style="font-size: 1.2em;">${t('ui.finalScore') || 'Final Score'}: <strong>${finalScore}</strong></p>
        <p>${t('ui.correctAnswers') || 'Correct Answers'}: ${correctAnswers} / ${totalQuestions}</p>
        <button style="margin-top: 30px; font-size: 1em;" onclick="location.reload()">🔄 ${t('ui.restart') || 'Restart'}</button>
      </div>
    `;
  }

  window.addEventListener('go-next', () => safeNext());

  requestAnimationFrame(() => {
	  const sess = getSession();
	  if (sess.current === 0 && sess.correct === 0) {
		safeNext();
	  }
	});

});
