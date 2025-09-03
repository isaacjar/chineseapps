// api.js
// Funciones para obtener caracteres desde MakeMeAHanzi
// y normalizar la salida a nuestro formato interno

const API_BASE = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary/";

export async function fetchCharacterFromAPI(char) {
  try {
    const codePoint = char.codePointAt(0).toString(10); // ej: 21315
    const url = `${API_BASE}${codePoint}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo obtener datos para ${char}`);
    }

    const data = await response.json();

    // Normalización: MakeMeAHanzi tiene campos como "definition", "pinyin", "radical"
    const normalized = {
      pinyin: data.pinyin || "",
      meaning_en: data.definition || "MakeMeAHanzi",
      meaning_es: "MakeMeAHanzi", // No disponible en la API
      radical: data.radical || "",
      strokes: data.strokes || (data.stroke_count || 0),
      frequency: data.frequency || 0,
      components: data.components || []
    };

    return normalized;
  } catch (err) {
    console.error("❌ Error en fetchCharacterFromAPI:", err);
    return null;
  }
}
