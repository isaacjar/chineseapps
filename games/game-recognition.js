import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { getSession, getSettings } from '../state.js';
import { randomNumberIn, numberToChinese, digitDistractors } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';

register('game-recognition', (root) => {
  const shell = gameShell(root, {
    title: '🔢 视觉识别 • Visual',
    prompt: t('games.recognitionPrompt'),
    onRenderQuestion: renderQuestion
  });

  let timer = null;

  function renderQuestion(){
    const s = getSettings();
    const n = randomNumberIn(s.range);
    const cn = numberToChinese(n);
    const options = shuffle([ n, ...digitDistractors(n, 3) ]);

    // UI
    root.querySelector('#prompt').innerHTML = `${cn}`;
    const elOptions = root.querySelector('#options');
    elOptions.innerHTML = '';
    root.querySelector('#answer-input').style.display = 'none';

    options.forEach(opt => {
      const el = document.createElement('button');
      el.className = 'option';
      el.innerHTML = `<span>🔢</span><span>${opt}</span>`;
      el.addEventListener('click', ()=> choose(opt, n));
      elOptions.appendChild(el);
    });

    // Timer
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
    if(timer) var timeLeft = timer.timeLeft();

    if(opt === correct){
      const pts = scoreCorrect(timeLeft ?? 0, s.timePerQuestion);
      this?.classList?.add?.('correct');
      toast(`✅ +${pts} 🏅`, 'good');
    }else{
      penalize();
      toast('❌', 'warn');
    }
    if(timer) timer.stop();
    endCheck();
  }

  function endCheck(){
    const sess = getSession();
    updateHUD(sess);
    setTimeout(() => {
      if(sess.lives <= 0 || sess.current >= sess.total){
        showEnd();
      }else{
        // Go next
        const evt = new CustomEvent('go-next');
        window.dispatchEvent(evt);
      }
    }, 600);
  }

  window.addEventListener('go-next', ()=> shell.next());

  shell.next();
});
