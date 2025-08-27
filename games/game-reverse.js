import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { getSession, getSettings } from '../state.js';
import { randomNumberIn, numberToChinese, chineseDistractors } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { shuffle } from '../rng.js';
import { t } from '../i18n.js';

register('game-reverse', (root) => {
  const shell = gameShell(root, {
    title: '✍️ Escritura inversa',
    prompt: t('games.reversePrompt'),
    onRenderQuestion: renderQuestion
  });

  let timer = null;

  function renderQuestion(){
    const s = getSettings();
    const n = randomNumberIn(s.range);
    const cn = numberToChinese(n);
    const options = shuffle([ cn, ...chineseDistractors(n, 3) ]);

    root.querySelector('#prompt').innerHTML = `${n}`;
    const elOptions = root.querySelector('#options');
    elOptions.innerHTML = '';
    options.forEach(opt => {
      const el = document.createElement('button');
      el.className = 'option';
      el.innerHTML = `<span>🈶</span><span style="font-size:20px">${opt}</span>`;
      el.addEventListener('click', ()=> choose(opt, cn));
      elOptions.appendChild(el);
    });

    // Timer
    const slot = root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if(timer) timer.stop();
    timer = createTimer(s.timePerQuestion, (left,total)=> paint(left,total), ()=>{
      penalize(); toast('⏳ '+t('ui.outOfTime'),'warn'); endCheck();
    });
  }

  function choose(opt