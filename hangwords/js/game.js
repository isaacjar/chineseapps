// game.js — lógica principal del juego
let settings = loadSettings();
let langStrings = JSON.parse(document.getElementById('langJson').textContent);
let voclistsIndex = [];
let currentList = null; // array of items
let currentWord = null;
let currentWordDisplay = [];
let mistakes = 0;
let maxMistakes = settings.lives;
let questionsLeft = settings.questions;
let lettersGuessed = new Set();
let stats = loadStats();

async function fetchVoclists(){
  const url = settings.gametype === 'chinese'
    ? 'https://isaacjar.github.io/chineseapps/voclists/index.js'
    : 'https://isaacjar.github.io/spanishapps/spanishvoc/voclists/index.js';
  try{
    const res = await fetch(url);
    const txt = await res.text();
    // index.js defines const voclists = [ ... ]; so evaluate safely
    const match = txt.match(/const\s+voclists\s*=\s*(\[([\s\S]*)\])/);
    if (match){
      const arrText = match[1];
      voclistsIndex = eval(arrText); // small risk but expected structure
    }
  }catch(e){
    console.warn('Could not fetch voclists index', e);
  }
}

async function fetchAndShowLists(){
  await fetchVoclists();
  const container = document.getElementById('voclistsContainer');
  container.innerHTML = '';
  voclistsIndex.forEach(rec=>{
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = rec.title || rec.filename;
    b.addEventListener('click', ()=>selectVoclist(rec.filename));
    container.appendChild(b);
  });
  showScreen('lists');
}

async function selectVoclist(filename){
  settings.voclist = filename;
  saveSettings(settings);
  // fetch file with words
  const base = settings.gametype === 'chinese'
    ? 'https://isaacjar.github.io/chineseapps/voclists/'
    : 'https://isaacjar.github.io/spanishapps/spanishvoc/voclists/';
  try{
    const res = await fetch(base + filename + '.js');
    const txt = await res.text();
    // expect const words = [ ... ] with objects. Try to eval
    const m = txt.match(/const\s+\w+\s*=\s*(\[([\s\S]*)\])/);
    if (m){
      currentList = eval(m[1]);
      startGame();
    }
  }catch(e){
    console.error('Error loading list',e);
    toast('Error loading list');
  }
}

function startGame(){
  // reset
  mistakes = 0; lettersGuessed = new Set();
  maxMistakes = Number(settings.lives);
  questionsLeft = Number(settings.questions);
  document.getElementById('lives').textContent = maxMistakes;
  updateHangmanSVG(maxMistakes);
  showScreen('game');
  nextWord();
}

function pickRandomWord(){
  if (!Array.isArray(currentList) || currentList.length===0) return null;
  const idx = Math.floor(Math.random()*currentList.length);
  const item = currentList[idx];
  // item could be string or object with fields depending on source
  if (typeof item === 'string') return {ch:item};
  return item;
}

function nextWord(){
  if (questionsLeft<=0){
    endGame(); return;
  }
  currentWord = pickRandomWord();
  if (!currentWord) {toast('No words'); return}
  // by default show Chinese word if playing chinese
  const displayText = settings.gametype==='chinese' ? (currentWord.ch || currentWord.word || currentWord.filename || '') : (currentWord.es || currentWord.en || currentWord.word || '');
  currentWord._raw = String(displayText || '');
  // for simplicity treat as Latin letters when gametype != chinese, else each character
  if (settings.gametype === 'chinese'){
    currentWordDisplay = Array.from(currentWord._raw).map(c => (c.trim() ? '_' : ' '));
  }else{
    currentWordDisplay = currentWord._raw.split('').map(ch=> ch.match(/\s/) ? ' ' : '_');
  }
  renderWord();
  renderKeyboard();
}

function renderWord(){
  const wa = document.getElementById('wordArea');
  wa.innerHTML = '';
  currentWordDisplay.forEach((ch,i)=>{
    const span = document.createElement('span');
    span.className = 'word-ch';
    span.textContent = ch + '\u00A0';
    wa.appendChild(span);
  });
}

function renderKeyboard(){
  const kb = document.getElementById('keyboard'); kb.innerHTML = '';
  const letters = settings.gametype === 'spanish' ? 'abcdefghijklmnopqrstuvwxyzñ' : 'abcdefghijklmnopqrstuvwxyz';
  letters.split('').forEach(l=>{
    const k = document.createElement('div');
    k.className = 'key'; k.textContent = l;
    if (lettersGuessed.has(l)) k.classList.add('disabled');
    k.addEventListener('click', ()=>onLetter(l,k));
    kb.appendChild(k);
  });
}

function onLetter(letter, keyEl){
  if (lettersGuessed.has(letter)) return;
  lettersGuessed.add(letter);

  // if chinese mode, we won't use keyboard letters; but keep for spanish/english
  let success = false;
  if (settings.gametype !== 'chinese'){
    // compare lowercased
    const idxs = [];
    for (let i=0;i<currentWord._raw.length;i++){
      if (currentWord._raw[i].toLowerCase() === letter.toLowerCase()) idxs.push(i);
    }
    if (idxs.length>0){
      idxs.forEach(i=> currentWordDisplay[i] = currentWord._raw[i]);
      success = true;
    }
  } else {
    // chinese: interpret keyboard input as pinyin? For now treat as wrong
    success = false;
  }

  if (success){
    keyEl.classList.add('correct');
    toast(randomFrom(langStrings[settings.lang].successMessages));
    // update stats
    stats.played = (stats.played||0) + 1; stats.correct = (stats.correct||0) + 1; saveStats(stats);
    renderWord();
    // check if finished
    if (!currentWordDisplay.includes('_')){
      questionsLeft--; setTimeout(()=>nextWord(), 600);
    }
  }else{
    keyEl.classList.add('wrong');
    mistakes++;
    renderHangman(mistakes);
    toast(randomFrom(langStrings[settings.lang].failMessages));
    stats.played = (stats.played||0) + 1; stats.incorrect = (stats.incorrect||0) + 1; saveStats(stats);
    if (mistakes >= maxMistakes){
      // reveal word and end this word
      revealWord();
      questionsLeft--; setTimeout(()=>{
        if (questionsLeft<=0) endGame(); else nextWord();
      },900);
    }
  }
}

function revealWord(){
  for (let i=0;i<currentWord._raw.length;i++) currentWordDisplay[i] = currentWord._raw[i];
  renderWord();
}

function endGame(){
  updateStatsUI();
  showScreen('stats');
}

function randomFrom(arr){
  if (!Array.isArray(arr)) return '';
  return arr[Math.floor(Math.random()*arr.length)];
}

/* HANGMAN SVG generation and update */
function updateHangmanSVG(parts){
  const svg = document.getElementById('hangmanSVG');
  svg.innerHTML = '';
  // draw gallows
  const ns = 'http://www.w3.org/2000/svg';
  function el(name, attrs){
    const e = document.createElementNS(ns,name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  svg.appendChild(el('line',{x1:10,y1:240,x2:150,y2:240,stroke:'#0f172a', 'stroke-width':3, 'stroke-linecap':'round'}));
  svg.appendChild(el('line',{x1:40,y1:240,x2:40,y2:30,stroke:'#0f172a', 'stroke-width':3,'stroke-linecap':'round'}));
  svg.appendChild(el('line',{x1:40,y1:30,x2:110,y2:30,stroke:'#0f172a','stroke-width':3,'stroke-linecap':'round'}));
  svg.appendChild(el('line',{x1:110,y1:30,x2:110,y2:50,stroke:'#0f172a','stroke-width':3,'stroke-linecap':'round'}));

  // parts in order: head, body, left arm, right arm, left leg, right leg, face
  const partsDraw = [
    el('circle',{cx:110,cy:72,r:16,stroke:'#0f172a','stroke-width':2,fill:'none','class':'hpart','id':'p-head'}),
    el('line',{x1:110,y1:88,x2:110,y2:140,stroke:'#0f172a','stroke-width':2,'class':'hpart','id':'p-body'}),
    el('line',{x1:110,y1:100,x2:86,y2:118,stroke:'#0f172a','stroke-width':2,'class':'hpart','id':'p-al'}),
    el('line',{x1:110,y1:100,x2:134,y2:118,stroke:'#0f172a','stroke-width':2,'class':'hpart','id':'p-ar'}),
    el('line',{x1:110,y1:140,x2:94,y2:180,stroke:'#0f172a','stroke-width':2,'class':'hpart','id':'p-ll'}),
    el('line',{x1:110,y1:140,x2:126,y2:180,stroke:'#0f172a','stroke-width':2,'class':'hpart','id':'p-lr'}),
    el('g',{class:'hpart','id':'p-face'})
  ];
  partsDraw[6].innerHTML = `<line x1="104" y1="68" x2="106" y2="70" stroke="#0f172a" stroke-width="1.5"/><line x1="106" y1="68" x2="104" y2="70" stroke="#0f172a" stroke-width="1.5"/><line x1="114" y1="68" x2="116" y2="70" stroke="#0f172a" stroke-width="1.5"/><line x1="116" y1="68" x2="114" y2="70" stroke="#0f172a" stroke-width="1.5"/><path d="M104 76 Q110 80 116 76" stroke="#0f172a" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

  partsDraw.forEach(p=>svg.appendChild(p));

  // set visibility based on parts count
  for (let i=0;i<partsDraw.length;i++){
    const node = document.getElementById(partsDraw[i].id);
    if (i < (parts || 0)) node.classList.add('visible');
    else node.classList.remove('visible');
  }
}

function renderHangman(mistakesCount){
  const partsCount = Math.min(mistakesCount, 6);
  const svg = document.getElementById('hangmanSVG');
  // set classes
  ['p-head','p-body','p-al','p-ar','p-ll','p-lr','p-face'].forEach((id,idx)=>{
    const el = document.getElementById(id);
    if (!el) return;
    if (idx < mistakesCount) el.classList.add('visible'); else el.classList.remove('visible');
  });
}
