// analyzer.js
// Núcleo de la lógica de análisis de caracteres

import { getCharacterData } from "./api.js";
import { setMsg } from "./ui.js";

let charsData = {};   // Se cargará desde chars.json
let currentLang = "en"; // Se gestiona en settings.js

/**
 * Inicializa el diccionario de caracteres.
 * @param {Object} data - contenido de chars.json
 */
export function loadCharsData(data) {
  charsData = data;
}

/**
 * Configura el idioma para meanings.
 */
export function setLanguage(lang) {
  currentLang = lang;
}

/**
 * Analiza un texto carácter por carácter.
 * @param {string} text
 * @param {"simple"|"full"} mode
 * @returns {Promise<string[]>} - array de líneas formateadas
 */
export async function analyzeText(text, mode = "simple") {
  const results = [];

  for (const ch of text) {
    if (/\s/.test(ch)) continue; // ignorar espacios
    const line = await analyzeCharacter(ch, mode);
    if (line) results.push(line);
  }

  return results;
}

/**
 * Analiza un carácter individual.
 * @param {string} char
 * @param {"simple"|"full"} mode
 * @returns {Promise<string>} línea formateada
 */
async function analyzeCharacter(char, mode) {
  let charObj = charsData[char];

  // Si no está en el diccionario, lo buscamos en API
  if (!charObj) {
    const apiData = await getCharacterData(char);
    if (!apiData) return `${char} ➜ [No encontrado]`;

    charObj = apiData;
    charsData[char] = charObj; // lo añadimos para persistencia
    setMsg(`Añadido ${char} desde API`);
  }

  // Obtenemos sus componentes
  let components;
  if (mode === "simple") {
    components = charObj.components || [];
  } else {
    components = await expandComponentsRecursive(charObj);
  }

  // Formateamos la línea
  return formatCharacterLine(char, charObj, components);
}

/**
 * Expande recursivamente los componentes de un carácter
 * hasta llegar a los más básicos.
 * @param {Object} charObj
 * @returns {Promise<string[]>} array de componentes finales
 */
async function expandComponentsRecursive(charObj) {
  const results = [];

  if (!charObj.components || charObj.components.length === 0) {
    return results;
  }

  for (const comp of charObj.components) {
    let compObj = charsData[comp];

    if (!compObj) {
      compObj = await getCharacterData(comp);
      if (compObj) charsData[comp] = compObj;
    }

    if (compObj && compObj.components && compObj.components.length > 0) {
      const sub = await expandComponentsRecursive(compObj);
      results.push(...sub);
    } else {
      results.push(comp);
    }
  }

  return [...new Set(results)]; // quitamos duplicados
}

/**
 * Formatea la línea de salida.
 * Ejemplo: 数 [shù] ➜ 米 [mǐ] arroz, 女 [nǚ] mujer
 */
function formatCharacterLine(char, charObj, components) {
  const pinyinMain = charObj.pinyin || "";
  const langField = currentLang === "es" ? "meaning_es" : "meaning_en";

  const parts = components.map(c => {
    const cObj = charsData[c];
    if (!cObj) return `${c}`;
    return `${c} [${cObj.pinyin || ""}] ${cObj[langField] || ""}`;
  });

  return `${char} [${pinyinMain}] ➜ ${parts.join(", ")}`;
}

/**
 * Devuelve el diccionario completo actualizado (para guardar/descargar).
 */
export function getCharsData() {
  return charsData;
}
