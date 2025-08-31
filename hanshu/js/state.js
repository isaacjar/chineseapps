// state.js

const STORAGE_KEY = 'hanshu-state';

// Estado de la sesión de juego (score, streak, vidas, etc.)
let session = {
  score: 0,
  streak: 0,
  lives: 3,
  bestStreak: 0,
  errors: 0,
};

// Valores por defecto de configuración
const defaultSettings = {
  language: 'en',
  range: 'r1_10',
  qcount: 10,
  qtime: 10,   // tiempo por pregunta (s)
  fails: 3,
  difficulty: 1 // 1 = fácil, 2 = difícil
};

// Estado de configuración (se carga de localStorage si existe)
let settings = { ...defaultSettings };

loadState();
// ⚡ OVERRIDE CON PARÁMETROS EN URL 
applyUrlOverrides();

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
	bestStreak: 0,
    errors: 0,
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

/**
 * Sobrescribe settings con parámetros de la URL (si existen)
 */
function applyUrlOverrides() {
  const params = new URLSearchParams(window.location.search);

  // Definimos las claves que aceptamos
  const overrides = {};

  if (params.has('rangeMin') && params.has('rangeMax')) {
    overrides.minValue = parseInt(params.get('rangeMin'));
    overrides.maxValue = parseInt(params.get('rangeMax'));
	console.log("👾 Override rango -> min:", overrides.minValue, "max:", overrides.maxValue);
  }

  if (params.has('qcount')) {
    overrides.qcount = parseInt(params.get('qcount'));
	console.log("👾 Override nº questions: ", overrides.qcount);
  }

  if (params.has('qtime')) {
    overrides.qtime = parseInt(params.get('qtime'));
	console.log("👾 Override time: ", overrides.qtime);
  }

  if (params.has('fails')) {
    overrides.fails = Math.max(1, parseInt(params.get('fails'))); // nunca menos de 1
	console.log("👾 Override fails: ", overrides.fails);
  }

  if (params.has('difficulty')) {
    const diff = parseInt(params.get('difficulty'));
    overrides.difficulty = diff === 2 ? 2 : 1;
	console.log("👾 Override difficulty: ", overrides.difficulty);
  }

  // 👇 Si hay overrides, machacamos settings y no respetamos localStorage
  if (Object.keys(overrides).length > 0) {
    settings = { ...settings, ...overrides };
  }
}