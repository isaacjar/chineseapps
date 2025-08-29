// game-helpers.js
import { getSettings } from '../state.js';
import { sample, shuffle } from '../rng.js';

/**
 * Renderiza opciones múltiples (4 o 6 botones según dificultad)
 * @param {string[]} allOptions - lista de posibles respuestas
 * @param {string} correct - la respuesta correcta
 * @param {Function} onAnswer - callback con (isCorrect)
 */
export function renderOptions(allOptions, correct, onAnswer) {
  const container = document.createElement('div');
  container.className = 'options';

  // dificultad => cuántas opciones mostrar
  const difficulty = getSettings().difficulty || 1;
  const optionCount = difficulty === 2 ? 6 : 4;

  // aseguramos que la correcta siempre esté incluida
  let options = allOptions.filter(opt => opt !== correct);
  options = sample(options, optionCount - 1);
  options.push(correct);

  // mezclar opciones
  options = shuffle(options);

  // crear botones
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn option';
    btn.textContent = opt;

    btn.addEventListener('click', () => {
      const isCorrect = opt === correct;
      onAnswer(isCorrect, opt);
    });

    container.appendChild(btn);
  });

  return container;
}
