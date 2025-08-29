// state.js

// Estado de la sesión de juego (score, streak, vidas, etc.)
let session = {
  score: 0,
  streak: 0,
  lives: 3, // valor inicial (puede parametrizarse desde settings.js)
};

// Estado de configuración (settings del jugador)
let settings = {
  language: 'en',
  pinyin: true,
  range: 'r1_10',
  qcount: 10,
  qtime: 30,
  fails: 3,
};

/**
 * Devuelve el estado actual de la sesión (inmutable)
 */
export function getSession() {
  return { ...session };
}

/**
 * Reemplaza/actualiza el estado de la sesión
 * @param {object} newSession - propiedades a sobrescribir
 */
export function setSession(newSession) {
  session = { ...session, ...newSession };
}

/**
 * Resetea la sesión a valores iniciales
 */
export function resetSession() {
  session = {
    score: 0,
    streak: 0,
    lives: settings.fails ?? 3, // si hay config de errores permitidos
  };
}

/**
 * Devuelve los ajustes (settings) actuales
 */
export function getSettings() {
  return { ...settings };
}

/**
 * Reemplaza/actualiza los ajustes
 * @param {object} newSettings - propiedades a sobrescribir
 */
export function setSettings(newSettings) {
  settings = { ...settings, ...newSettings };
}

/**
 * Inicializa el estado desde almacenamiento local
 */
export function loadState() {
  try {
    const saved = localStorage.getItem('hanshu-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.settings) settings = parsed.settings;
      if (parsed.session) session = parsed.session;
    }
  } catch (e) {
    console.warn('⚠️ Error al cargar estado:', e);
  }
}

/**
 * Guarda estado en almacenamiento local
 */
export function saveState() {
  try {
    localStorage.setItem('hanshu-state', JSON.stringify({ session, settings }));
  } catch (e) {
    console.warn('⚠️ Error al guardar estado:', e);
  }
}
