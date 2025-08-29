// game-helpers.js
import { sample } from '../rng.js';
import { getSettings } from '../state.js';

/**
 * Renderiza opciones como botones dentro del contenedor
 * @param {HTMLElement} container - contenedor donde renderizar
 * @param {string[]} options - lista de opciones
 * @param {Function} onSelect - callback con la opción elegida
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
 * @returns {string[]} opciones mezcladas
 */
export function generateOptions(correct, pool, difficulty) {
  const settings = getSettings();
  const count = difficulty || (settings.difficulty === 2 ? 6 : 4);

  // Filtramos la correcta del pool
  const filtered = pool.filter(x => x !== correct);

  // Tomamos distractores aleatorios
  const distractors = sample(filtered, count - 1);

  // Mezclamos y devolvemos
  return sample([correct, ...distractors], count);
}
