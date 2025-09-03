import { getCharacterData } from "./api.js";
import { renderOutput, highlightCharacters } from "./ui.js";

/**
 * Analiza el texto carácter por carácter.
 * @param {string} text - Texto en chino.
 * @param {string} lang - Idioma de salida ("es" | "en").
 */
export async function analyzeText(text, lang = "es") {
  const results = [];
  const charsToHighlight = new Set();

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) {
      // No es un carácter chino → lo añadimos tal cual
      results.push(ch);
      continue;
    }

    // Llamamos siempre a getCharacterData (cache + local + API)
    const data = await getCharacterData(ch);

    if (data) {
      results.push(
        `${ch} (${data.pinyin}) → ${lang === "es" ? data.meaning_es : data.meaning_en}`
      );

      if (data.radical) {
        charsToHighlight.add(ch);
      }
    } else {
      results.push(`${ch} (sin datos)`);
    }
  }

  // Mostrar resultados en pantalla
  renderOutput(results);

  // Resaltar caracteres que tienen radical
  highlightCharacters(text, charsToHighlight);
}
