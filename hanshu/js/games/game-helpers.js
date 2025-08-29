// game-helpers.js
import { rngSample } from '../rng.js';
import { getSettings } from '../state.js';
import { renderHUD } from '../ui.js';

/**
 * Renderiza opciones como botones dentro del contenedor
 */
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

/**
 * Genera opciones con respuesta correcta y distractores
 * @param {string} correct - Respuesta correcta
 * @param {string[]} pool - Pool de posibles respuestas
 * @param {number} [difficulty] - Número de opciones (si no, se usa settings)
 */
export function generateOptions(correct, pool, difficulty) {
  const settings = getSettings();
  const count = difficulty || (settings.difficulty === 2 ? 6 : 4);

  // Filtramos la correcta del pool
  const filtered = pool.filter(x => x !== correct);

  // Tomamos distractores aleatorios
  const distractors = rngSample(filtered, count - 1);

  // Mezclamos y devolvemos
  return rngSample([correct, ...distractors], count);
}
