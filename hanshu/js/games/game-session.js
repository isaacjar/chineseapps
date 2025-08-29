// game-session.js

const HISTORY_KEY = "cnlearn_history";

/**
 * Guarda una sesión de juego en el historial
 * 
 * @param {Object} summary
 * @param {string} summary.mode - modo de juego (ej. "recognition")
 * @param {number} summary.score - puntaje final
 * @param {number} summary.questions - total de preguntas jugadas
 * @param {number} summary.correct - respuestas correctas
 * @param {string} [summary.date] - fecha (ISO)
 */
export function saveGameSession(summary) {
  const history = getGameSessions();
  const entry = {
    ...summary,
    date: summary.date || new Date().toISOString()
  };
  history.push(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Devuelve el historial de partidas
 * @returns {Array}
 */
export function getGameSessions() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Borra el historial
 */
export function clearGameSessions() {
  localStorage.removeItem(HISTORY_KEY);
}
