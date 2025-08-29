// state.js

const STORAGE_KEY = 'hanshu-state';

// Estado de la sesión de juego (score, streak, vidas, etc.)
let session = {
  score: 0,
  streak: 0,
  lives: 3,
};

// Valores por defecto de configuración
const defaultSettings = {
  language: 'en',
  pinyin: true,
  range: 'r1_10',
  qcount: 10,
  qtime: 30,
  fails: 3,
  difficulty: 1
};

// Estado de configuración (se carga de localStorage si existe)
let settings = { ...defaultSettings };

loadState();

/**
 * Devuelve el estado actual de la sesión
 */
export function getSession() {
  return { ...session };
}

/**
 * Actualiza el estado de la sesión
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
    lives: settings.fails ?? 3,
  };
}

/**
 * Devuelve los ajustes actuales
 */
export function getSettings() {
  return { ...settings };
}

/**
 * Actualiza los ajustes
 */
export function setSettings(newSettings) {
  settings = { ...settings, ...newSettings };
}

/**
 * Resetea ajustes a valores por defecto
 */
export function resetSettings() {
  settings = { ...defaultSettings };
  saveState();
  return settings;
}

/**
 * Cargar desde localStorage
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.settings) settings = { ...defaultSettings, ...parsed.settings };
      if (parsed.session) session = parsed.session;
    }
  } catch (e) {
    console.warn('⚠️ Error al cargar estado:', e);
  }
}

/**
 * Guardar en localStorage
 */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, settings }));
  } catch (e) {
    console.warn('⚠️ Error al guardar estado:', e);
  }
}
