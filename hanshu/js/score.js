// score.js
import { setSession, getSession } from './state.js';
import { renderHUD } from './ui.js';

/**
 * Incrementa la puntuación en X puntos
 */
export function addScore(points) {
  const session = getSession();
  session.score += points;
  setSession(session);
  renderHUD(session);
}

/**
 * Reinicia la puntuación y la racha
 */
export function resetScore() {
  const session = getSession();
  session.score = 0;
  session.streak = 0;
  setSession(session);
  renderHUD(session);
}

/**
 * Maneja respuestas correctas
 */
export function handleCorrect() {
  const session = getSession();
  session.streak++;
  session.score += 10 * session.streak; // bonus progresivo
  setSession(session);
  renderHUD(session);
}

/**
 * Maneja respuestas incorrectas
 */
export function handleWrong() {
  const session = getSession();
  session.streak = 0;
  session.lives--;
  setSession(session);
  renderHUD(session);
}
