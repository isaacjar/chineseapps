// game-helpers.js
import { getSettings } from '../state.js';
import { rngSample } from '../rng.js';

/**
 * Obtiene el número de opciones a mostrar según la dificultad
 * @returns {number}
 */
export function getChoicesCount() {
  const settings = getSettings();
  switch (settings.difficulty) {
    case 'hard':
      return 6;
    case 'easy':
    default:
      return 4;
  }
}

/**
 * Genera opciones de respuesta (correcta + distractores)
 * @param {*} correct - la respuesta correcta
 * @param {Array} pool - conjunto de posibles respuestas
 * @returns {Array} opciones mezcladas
 */
export function generateOptions(correct, pool) {
  const count = getChoicesCount();
  const distractors = rngSample(pool.filter(x => x !== correct), count - 1);
  const options = [correct, ...distractors];
  return rngSample(options, options.length); // mezcla
}

/**
 * Renderiza los botones de opciones dentro de un contenedor
 * @param {HTMLElement} container
 * @param {Array} options
 * @param {Function} onSelect - callback con la opción seleccionada
 */
export function renderOptions(container, options, onSelect) {
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn option';
    btn.textContent = opt;
    btn.addEventListener('click', () => onSelect(opt));
    container.appendChild(btn);
  });
}
