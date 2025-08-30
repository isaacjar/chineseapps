// i18n.js

let translations = {};
let currentLang = 'en';

/**
 * Carga el archivo de idiomas (lang.json) una sola vez
 */
async function loadTranslations() {
  if (Object.keys(translations).length > 0) return translations;

  try {
    const res = await fetch('assets/lang/lang.json');
    translations = await res.json();
  } catch (err) {
    console.error('[i18n] Error loading lang.json', err);
    translations = { en: {} };
  }
  return translations;
}

/**
 * Cambia el idioma actual
 */
export async function setLang(lang) {
  await loadTranslations();
  if (translations[lang]) {
    currentLang = lang;
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
  await loadTranslations();
  await setLang(defaultLang);
}

export { translations };