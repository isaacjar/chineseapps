import { data as localChars } from "../data/chars.json";

const API_BASE = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/data";

// Aquí guardaremos los nuevos caracteres obtenidos de la API
let newChars = {};

/**
 * Busca primero en cache/local, luego en la API si no existe.
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
}

/**
 * Llama a MakeMeAHanzi para obtener datos de un carácter.
 */
async function fetchCharacterFromAPI(char) {
  try {
    const codePoint = char.codePointAt(0).toString(10); // ej: 20320
    const url = `${API_BASE}/${codePoint}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo obtener datos para ${char} (${codePoint})`);
    }

    const data = await response.json();

    // Normalización
    const normalized = {
      pinyin: data.pinyin || "",
      meaning_en: data.definition || "MakeMeAHanzi",
      meaning_es: "MakeMeAHanzi", // No disponible
      radical: data.radical || "",
      strokes: data.strokes || data.stroke_count || 0,
      frequency: data.frequency || 0,
      components: data.components || []
    };

    return normalized;
  } catch (err) {
    console.error("❌ Error en fetchCharacterFromAPI:", err);
    return null;
  }
}
