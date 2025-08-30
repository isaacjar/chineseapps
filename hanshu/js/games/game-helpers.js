// game-helpers.js
import { sample } from '../rng.js';
import { getSettings, getSession } from '../state.js';
import { smoothNavigate } from '../ui.js';
import { navigate } from '../router.js';   // 👈 Corrige refresco pantalla 

// ===== Helpers de rango =====
function getNumberRange() {
  const r = getSettings().range || 'r1_10';
  switch (r) {
    case 'r1_10': return [1, 10];
    case 'r11_99': return [11, 99];
    case 'r100_999': return [100, 999];
    case 'r1000_9999': return [1000, 9999];
    case 'r10000_9999999': return [10000, 9999999];
    default: return [1, 10];
  }
}

function randomInRange() {
  const [min, max] = getNumberRange();
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== Conversores numéricos =====
const hanziDigits = ["零","一","二","三","四","五","六","七","八","九"];
const pinyinDigits = ["líng","yī","èr","sān","sì","wǔ","liù","qī","bā","jiǔ"];

const hanziUnits = ["","十","百","千","万","十万","百万"];
const pinyinUnits = ["","shí","bǎi","qiān","wàn","shí wàn","bǎi wàn"];

function toChineseNumber(num) {
  if (num === 0) return hanziDigits[0];

  let str = "";
  const digits = String(num).split("").map(d => parseInt(d,10));
  const len = digits.length;
  let zero = false;

  digits.forEach((d,i) => {
    const pos = len - i - 1;
    if (d === 0) {
      zero = true;
    } else {
      if (zero) {
        str += hanziDigits[0];
        zero = false;
      }
      if (!(d === 1 && pos === 1 && str === "")) {
        str += hanziDigits[d];
      }
      str += hanziUnits[pos];
    }
  });

  return str;
}

function toPinyin(num) {
  if (num === 0) return pinyinDigits[0];

  let str = "";
  const digits = String(num).split("").map(d => parseInt(d,10));
  const len = digits.length;
  let zero = false;

  digits.forEach((d,i) => {
    const pos = len - i - 1;
    if (d === 0) {
      zero = true;
    } else {
      if (zero) {
        str += pinyinDigits[0] + " ";
        zero = false;
      }
      if (!(d === 1 && pos === 1 && str === "")) {
        str += pinyinDigits[d] + " ";
      }
      str += pinyinUnits[pos] + " ";
    }
  });

  return str.trim();
}

// ===== Renderizado genérico de opciones =====
export function renderOptions(container, options, onSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'options';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn option';
    btn.textContent = opt;
    btn.addEventListener('click', () => onSelect(opt));
    wrapper.appendChild(btn);
  });

  container.appendChild(wrapper);
}

// ===== Generación de opciones con distractores =====
export function generateOptions(correct, pool, difficulty) {
  const settings = getSettings();
  const count = difficulty || (settings.difficulty === 'hard' ? 6 : 4);

  const filtered = pool.filter(x => x !== correct);
  const distractors = sample(filtered, count - 1);
  return sample([correct, ...distractors], count);
}

// ===== Generadores de preguntas para cada modo =====

// Reconocimiento: carácter chino → número
export function getRandomQuestion() {
  const num = randomInRange();
  const prompt = toChineseNumber(num);
  const answer = String(num);

  const [min, max] = getNumberRange();
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(String(i));
  const options = generateOptions(answer, pool);

  return { prompt, options, answer };
}

// Reverse: número → carácter chino
export function getRandomReverseQuestion() {
  const num = randomInRange();
  const prompt = String(num);
  const answer = toChineseNumber(num);

  const [min, max] = getNumberRange();
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(toChineseNumber(i));

  const options = generateOptions(answer, pool);

  return { prompt, options, answer };
}

// Pinyin desde caracteres
export function getRandomPinyinFromCharsQuestion() {
  const num = randomInRange();
  const prompt = toChineseNumber(num);
  const answer = toPinyin(num);

  const [min, max] = getNumberRange();
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(toPinyin(i));
  const options = generateOptions(answer, pool);

  return { prompt, options, answer };
}

// Pinyin desde dígitos
export function getRandomPinyinFromDigitsQuestion() {
  const num = randomInRange();
  const prompt = String(num);
  const answer = toPinyin(num);

  const [min, max] = getNumberRange();
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(toPinyin(i));
  const options = generateOptions(answer, pool);

  return { prompt, options, answer };
}

// ===== Pantalla de Game Over =====
export function showGameOver() {
  const session = getSession();

  smoothNavigate(() => {
    const view = document.querySelector('#view');
    view.innerHTML = `
      <div class="game-over-screen">
        <h2>Game Over</h2>
        <p>Final Score: <strong>${session.score}</strong></p>        
		<p>Errors: <strong>${(session.fails ?? 0) - (session.lives ?? 0)}</strong></p>
		<p><strong>${session.qcount}</strong> questions</p>
		<p>🔥 Best Streak: ${session.bestStreak ?? 0}</p>
		<p>Errors: <strong>${(session.fails ?? 0) - (session.lives ?? 0)}</strong></p>
        <div class="game-over-buttons">
          <button id="btn-restart" class="btn">🔄 Restart</button>
          <button id="btn-menu" class="btn">🏠 Back to menu</button>
        </div>
      </div>
    `;

    document.querySelector('#btn-restart').addEventListener('click', () => {
      window.location.hash = `#${session.id}`;
    });

    document.querySelector('#btn-menu').addEventListener('click', () => {
      window.location.hash = '#menu';
	  navigate('menu');   // 👈 fuerza refresco del menú
    });
  });
}
