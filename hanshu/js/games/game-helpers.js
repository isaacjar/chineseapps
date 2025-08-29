// game-helpers.js
import { sample } from '../rng.js';
import { getSettings, getSession } from '../state.js';
import { smoothNavigate } from '../ui.js';

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

  // Quitamos la respuesta correcta del pool
  const filtered = pool.filter(x => x !== correct);

  // Distractores aleatorios
  const distractors = sample(filtered, count - 1);

  // Mezclamos y devolvemos
  return sample([correct, ...distractors], count);
}

// ===== Generadores de preguntas para cada modo =====

// Reconocimiento: dígito → carácter chino
export function getRandomQuestion() {
  const pool = ["一","二","三","四","五","六","七","八","九","十"];
  const answers = ["1","2","3","4","5","6","7","8","9","10"];
  const idx = Math.floor(Math.random() * pool.length);

  const prompt = pool[idx];
  const answer = answers[idx];
  const options = generateOptions(answer, answers);

  return { prompt, options, answer };
}

// Reverse: número → carácter chino
export function getRandomReverseQuestion() {
  const pool = ["一","二","三","四","五","六","七","八","九","十"];
  const answers = ["1","2","3","4","5","6","7","8","9","10"];
  const idx = Math.floor(Math.random() * answers.length);

  const prompt = answers[idx];
  const answer = pool[idx];
  const options = generateOptions(answer, pool);

  return { prompt, options, answer };
}

// Pinyin desde caracteres
export function getRandomPinyinFromCharsQuestion() {
  const pool = ["一","二","三","四","五","六","七","八","九","十"];
  const answers = ["yī","èr","sān","sì","wǔ","liù","qī","bā","jiǔ","shí"];
  const idx = Math.floor(Math.random() * pool.length);

  const prompt = pool[idx];
  const answer = answers[idx];
  const options = generateOptions(answer, answers);

  return { prompt, options, answer };
}

// Pinyin desde dígitos
export function getRandomPinyinFromDigitsQuestion() {
  const pool = ["1","2","3","4","5","6","7","8","9","10"];
  const answers = ["yī","èr","sān","sì","wǔ","liù","qī","bā","jiǔ","shí"];
  const idx = Math.floor(Math.random() * pool.length);

  const prompt = pool[idx];
  const answer = answers[idx];
  const options = generateOptions(answer, answers);

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
    });
  });
}
