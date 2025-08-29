// state.js

const SETTINGS_KEY = "cnlearn_settings";
let settings = {
  language: "en",
  range: "r1_99",
  qtime: 10,
  qcount: 10,
  lives: 3
};

// sesión actual (no persistente)
let session = null;

/**
 * ===== SETTINGS =====
 */
export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      settings = { ...settings, ...JSON.parse(raw) };
    } catch {
      console.warn("Invalid settings in localStorage, resetting.");
    }
  }
}

export function getSettings() {
  return settings;
}

export function setSettings(newS) {
  settings = { ...settings, ...newS };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * ===== SESSION =====
 */
export function newSession() {
  session = {
    score: 0,
    streak: 0,
    lives: settings.lives,
    question: 0
  };
  return session;
}

export function getSession() {
  return session;
}

export function loseLife() {
  if (session) {
    session.lives--;
  }
}
