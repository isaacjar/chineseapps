// score.js
import { getSession } from './state.js';
import { updateHUD } from './ui.js';

/**
 * Se llama cuando el jugador acierta.
 * 
 * @param {number} timeLeft - tiempo restante en segundos
 * @param {number} qtime - tiempo total por pregunta
 * @returns {number} puntos ganados
 */
export function scoreCorrect(timeLeft, qtime) {
  const s = getSession();
  if (!s) return 0;

  // puntos base
  let pts = 10;

  // bonus por rapidez (proporcional al tiempo sobrante)
  const speedBonus = Math.round((timeLeft / qtime) * 10);
  pts += speedBonus;

  // bonus por racha
  s.streak++;
  const streakBonus = Math.max(0, s.streak - 1) * 2;
  pts += streakBonus;

  // acumular
  s.score += pts;

  updateHUD();
  return pts;
}

/**
 * Se llama cuando el jugador falla.
 */
export function scoreWrong() {
  const s = getSession();
  if (!s) return;

  s.streak = 0; // reset racha
  updateHUD();
}
