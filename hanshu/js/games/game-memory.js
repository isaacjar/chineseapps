import { register } from '../router.js';
import { gameShell } from './game-helpers.js';
import { getSession, getSettings } from '../state.js';
import { randomNumberIn, numberToChinese, numberToPinyin } from '../chinese.js';
import { renderTimer, createTimer } from '../timer.js';
import { scoreCorrect, penalize } from '../score.js';
import { updateHUD, toast } from '../ui.js';
import { t } from '../i18n.js';

// Util para normalizar pinyin sin tonos
function stripDiacritics(s){
  const map = {
    'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e',
    'ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o',
    'ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü','ü':'u',
    'Ā':'A','Á':'A','Ǎ':'A','À':'A','Ē':'E','É':'E','Ě':'E','È':'E',
    'Ī':'I','Í':'I','Ǐ':'I','Ì':'I','Ō':'O','Ó':'O','Ǒ':'O','Ò':'O',
    'Ū':'U','Ú':'U','Ǔ':'U','Ù':'U','Ǖ':'Ü','Ǘ':'Ü','Ǚ':'Ü','Ǜ':'Ü','Ü':'U'
  };
  return s.split('').map(ch => map[ch] ?? ch).join('');
}

register('game-memory', (root) => {
  const shell = gameShell(root, {
    title: '🧠 Memoria',
    prompt: t('games.memoryShow'),
    onRenderQuestion: renderQuestion
  });

  let phase = 'show'; // 'show' | 'recall'
  let showTimer = null;
  let recallTimer = null;
  let currentSeq = [];
  let showDuration = 0;

  function renderQuestion(qIndex = 0){
    const s = getSettings();

    // Longitud de la secuencia: empieza en 3 y sube, tope 7
    const len = Math.min(3 + qIndex, 7);

    currentSeq = Array.from({ length: len }, () => randomNumberIn(s.range));
    const cnSeq = currentSeq.map(numberToChinese);
    const pnSeq = currentSeq.map(numberToPinyin);

    // UI fase "mostrar"
    phase = 'show';
    root.querySelector('#prompt').innerHTML = `${t('games.memoryShow')}`;
    const elOptions = root.querySelector('#options');
    const elInput = root.querySelector('#answer-input');
    elOptions.innerHTML = '';
    elInput.style.display = 'none';

    // Pizarra con la secuencia (caracteres y, si hay pistas, pinyin pequeñito)
    const board = document.createElement('div');
    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${len}, minmax(40px, 1fr))`;
    board.style.gap = '10px';
    board.style.marginTop = '6px';

    const sSettings = getSettings();
    cnSeq.forEach((cn, i) => {
      const cell = document.createElement('div');
      cell.className = 'card';
      cell.style.textAlign = 'center';
      cell.style.padding = '10px';
      cell.innerHTML = `
        <div style="font-size:22px; font-weight:800;">${cn}</div>
        ${sSettings.pinyinHints ? `<div style="font-size:12px; color:#6b7b8c;">${pnSeq[i]}</div>` : ''}
      `;
      board.appendChild(cell);
    });
    elOptions.appendChild(board);

    // Temporizador fase de muestra: ~2s por elemento, entre 3 y 10s
    showDuration = Math.max(3, Math.min(10, 2 + len));
    const slot = root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if(showTimer) showTimer.stop();
    if(recallTimer) recallTimer.stop();

    showTimer = createTimer(showDuration, (left,total)=> paint(left,total), () => {
      beginRecall();
    });
  }

  function beginRecall(){
    const s = getSettings();
    phase = 'recall';
    // Limpiar tablero y pedir reproducción
    const elOptions = root.querySelector('#options');
    const elInput = root.querySelector('#answer-input');
    elOptions.innerHTML = '';
    root.querySelector('#prompt').textContent = t('games.memoryRecall');

    elInput.style.display = 'flex';
    elInput.innerHTML = `
      <input id="mem-answer" class="input" placeholder="12, 45, 3  —  或  十二, 四十五, 三" autocomplete="off" />
      <button id="mem-submit" class="btn">✅ ${t('ui.confirm')}</button>
    `;
    const $in = elInput.querySelector('#mem-answer');
    const $btn = elInput.querySelector('#mem-submit');

    const slot = root.querySelector('#timer-slot');
    const paint = renderTimer(slot);
    if(recallTimer) recallTimer.stop();
    recallTimer = createTimer(s.timePerQuestion, (left,total)=> paint(left,total), ()=>{
      penalize();
      toast('⏳ ' + t('ui.outOfTime'), 'warn');
      endCheck();
    });

    $btn.addEventListener('click', ()=> submit($in.value));
    $in.addEventListener('keydown', (e)=> {
      if(e.key === 'Enter') submit($in.value);
    });
    $in.focus();
  }

  function submit(text){
    const s = getSettings();
    if(phase !== 'recall') return;

    // Parseo de tokens por coma o espacios
    const tokens = text.split(/[\s,，]+/).map(x => x.trim()).filter(Boolean);
    const expectedLen = currentSeq.length;

    // Construimos referencias aceptadas por posición
    const expected = currentSeq.map(n => ({
      digits: String(n),
      hanzi: numberToChinese(n),
      pinyin: numberToPinyin(n)
    }));

    // Normalizadores
    const norm = (x) => x.trim();
    const normPy = (x) => stripDiacritics(x.trim().toLowerCase()).replace(/\s+/g,' ');
    const expectedNorm = expected.map(e => ({
      digits: norm(e.digits),
      hanzi: norm