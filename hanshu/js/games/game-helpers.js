import { getSession, getSettings, incQuestion } from '../state.js';
import { updateHUD } from '../ui.js';

export function gameShell(root, { title, prompt, onRenderQuestion, onAnswer, onTimeout }){
  root.innerHTML = `
    <section class="game">
      <div class="card">
        <div class="hud-row">
          <h2>${title}</h2>
          <button id="btn-back" class="btn btn-ghost">⬅️ Menu</button>
        </div>
        <div id="timer-slot"></div>
      </div>

      <div class="card">
        <div class="prompt" id="prompt">${prompt}</div>
        <div class="options" id="options"></div>
        <div class="answer-input" id="answer-input" style="display:none"></div>
      </div>

      <div class="card">
        <div id="progress" class="badge">🌱</div>
      </div>
    </section>
  `;

  root.querySelector('#btn-back').addEventListener('click', ()=> location.hash = '#menu');

  const q = { index: 0 };
  const s = getSettings();

  function renderProgress(){
    const sess = getSession();
    root.querySelector('#progress').textContent = `🌱 ${sess.current}/${sess.total}`;
  }

  function next(){
    const sess = getSession();
    if(sess.current >= sess.total || sess.lives <= 0){
      onRenderQuestion(null);
      return;
    }
    onRenderQuestion(q.index++);
    incQuestion();
    renderProgress();
    updateHUD(sess);
  }

  return { next, settings: s, root };
}
