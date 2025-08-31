// i18n.js
import translations from '../assets/lang/lang.json';
export { translations };
let currentLang = localStorage.getItem('lang') || 'en';

/**
 * Cambia el idioma actual
 */
export async function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
	localStorage.setItem('lang', lang);
  } else {
    console.warn(`[i18n] Language ${lang} not found, fallback to en`);
    currentLang = 'en';
  }
}

/**
 * Devuelve el idioma actual
 */
export function getLang() {
  return currentLang;
}

/**
 * Traducción con fallback a inglés
 */
export function t(key) {
  if (!translations[currentLang]) return key;

  const value = getNested(translations[currentLang], key);
  if (value !== undefined) return value;

  // fallback a inglés
  const fallback = getNested(translations['en'], key);
  return fallback !== undefined ? fallback : key;
}

/**
 * Helper para acceder a claves anidadas con dot notation
 * ej: "ui.settings"
 */
function getNested(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Inicializa i18n: carga traducciones y asegura que haya inglés por defecto
 */
export async function initI18n(defaultLang = 'en') {
  setLang(defaultLang);
}

export { translations };