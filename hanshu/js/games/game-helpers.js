// game-helpers.js
import { getSession, setSession } from '../state.js';
import { updateHUD } from '../ui.js';

/**
 * Reinicia la sesión de juego (score, streak, lives)
 */
export function resetGameSession() {
  const session = getSession();
  session.score = 0;
  session.streak = 0;
  session.lives = 3; // puedes mover este valor a settings si quieres
  setSession(session);
  updateHUD(session);
}

/**
 * Resta una vida y actualiza el HUD
 */
export function loseLife() {
  const session = getSession();
  if (session.lives > 0) {
    session.lives -= 1;
  }
  session.streak = 0; // romper racha al perder vida
  setSession(session);
  updateHUD({ lives: session.lives, streak: session.streak });
  return session.lives;
}

/**
 * Suma racha sin aumentar puntuación
 */
export function addStreak() {
  const session = getSession();
  session.streak += 1;
  setSession(session);
  updateHUD({ streak: session.streak });
}

/**
 * Devuelve true si la partida terminó (vidas agotadas)
 */
export function isGameOver() {
  const session = getSession();
  return session.lives <= 0;
}
