import { data as localChars } from "../data/chars.js";

const API_BASE = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/data";

// Aquí guardamos los nuevos caracteres obtenidos de la API
let newChars = {};

/**
 * Obtiene datos de un carácter chino.
 * 1. Busca en localStorage (cache).
 * 2. Busca en el JSON local.
 * 3. Si no existe, lo pide a la API.
 * @param {string} char - Carácter chino.
 * @returns {Promise<object|null>}
 */
export async function getCharacterData(char) {
  // 1. Revisar cache localStorage
  const cached = localStorage.getItem(`char_${char}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Revisar JSON local
  if (localChars[char]) {
    return localChars[char];
  }

  // 3. Llamar a la API externa
  const apiData = await fetchCharacterFromAPI(char);

  if (apiData) {
    // Guardar en cache
    localStorage.setItem(`char_${char}`, JSON.stringify(apiData));

    // Guardar en colección de nuevos caracteres
    newChars[char] = apiData;
  }

  return apiData;
}

/**
 * Devuelve los nuevos caracteres obtenidos desde la API.
 */
export function getNewChars() {
  return newChars;
}

/**
 * Descarga un JSON con los nuevos caracteres.
 */
export function downloadNewCharsJSON() {
  if (Object.keys(newChars).length === 0) {
    alert("No hay nuevos caracteres para guardar.");
    return;
  }

  const blob = new Blob([JSON.stringify(newChars, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "new_chars.json";
  a.click();
  URL.revokeObjectURL(url);

  console.log("⬇️ new_chars.json descargado");
}

/**
 * Llama a MakeMeAHanzi para obtener datos de un carácter.
 * @param {string} char
 * @returns {Promise<object|null>}
 */
async function fetchCharacterFromAPI(char) {
  try {
    const codePointHex = char.codePointAt(0).toString(16).toLowerCase();
    const url = `${API_BASE}/${codePointHex}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo obtener datos para ${char} (${url})`);
    }

    const data = await response.json();

    // Normalización de la respuesta
    return {
      pinyin: data.pinyin || "",
      meaning_en: data.definition || "MakeMeAHanzi",
      meaning_es: "MakeMeAHanzi", // No disponible en la API
      radical: data.radical || "",
      strokes: data.strokes || (data.stroke_count || 0),
      frequency: data.frequency || 0,
      components: data.components || []
    };
  } catch (err) {
    console.error("❌ Error en fetchCharacterFromAPI:", err);
    return null;
  }
}
