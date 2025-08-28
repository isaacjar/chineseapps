import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { getSession, getSettings } from '../state.js';
import { randomNumberIn, numberToChinese, numberToPinyin, pinyinDistractors } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';

register('game-pinyin-from-chars', (root) => {
  const shell = gameShell(root, {
    title: '✍️ Pinyin desde caracteres',
    prompt: t('games.pinyinCharsPrompt'),
    onRenderQuestion: renderQuestion
  });

  let timer = null;

  function renderQuestion(){
    const s = getSettings();
    const n = randomNumberIn(s.range);
    const cn = numberToChinese(n);
    const pn = numberToPinyin(n);
    const options = shuffle([ pn, ...pinyinDistractors(n, 3) ]);

    root.querySelector('#prompt').innerHTML = `${cn}`;
    const elOptions = root.querySelector('#options');
    elOptions.innerHTML = '';
    root.querySelector('#answer-input').style.display = 'none';

    options.forEach(opt => {
      const el = document.createElement('button');
      el.className = 'option';
      el.innerHTML = `<span>🎐</span><span>${opt}</span>`;
      el.addEventListener('click', ()=> choose(opt, pn));
      elOptions.appendChild(el);
    });

    // Timer
    const slot = root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if(timer) timer.stop();
    timer = createTimer(s.timePerQuestion, (left,total)=> paint(left,total), ()=>{
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
        window.dispatchEvent(new CustomEvent('go-next'));
      }
    }, 600);
  }

  function showEnd(){
    root.innerHTML = `
      <section class="game card">
        <h2>🏆 ${t('games.finalScore')}</h2>
        <p>${t('ui.score')}: ${getSession().score}</p>
        <button class="btn" id="btn-restart">${t('games.playAgain')}</button>
        <button class="btn btn-secondary" id="btn-menu">${t('ui.backMenu')}</button>
      </section>
    `;
    root.querySelector('#btn-restart').addEventListener('click', ()=> location.hash = '#game-pinyin-from-chars');
    root.querySelector('#btn-menu').addEventListener('click', ()=> location.hash = '#menu');
  }

  window.addEventListener('go-next', ()=> shell.next());

  shell.next();
});
