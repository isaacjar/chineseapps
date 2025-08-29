// score.js
import { getSession, setSession } from './state.js';
import { updateHUD } from './ui.js';

/**
 * Incrementa la puntuación en función de rapidez y precisión
 * @param {number} basePoints - puntos base
 * @param {number} timeBonus - bonificación por rapidez
 */
export function addScore(basePoints = 10, timeBonus = 0) {
  const session = getSession();
  const totalPoints = basePoints + timeBonus;

  session.score += totalPoints;
  session.streak += 1; // sumar racha
  setSession(session);

  updateHUD({ score: session.score, streak: session.streak });
}

/**
 * Penaliza al jugador (resta vida y rompe racha)
 */
export function penalize() {
  const session = getSession();
  session.lives -= 1;
  session.streak = 0;
  setSession(session);

  updateHUD({ lives: session.lives, streak: session.streak });
}

/**
 * Reinicia el marcador de sesión
 */
export function resetScore() {
  const session = getSession();
  session.score = 0;
  session.streak = 0;
  session.lives = 3; // valor inicial configurable si quieres moverlo a settings
  setSession(session);

  updateHUD(session);
}
