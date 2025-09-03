// debug.js
import { renderOutput } from "./ui.js";
import { data as localChars } from "../data/chars.js";

export async function debugText(text, lang = "es") {
  const results = [];
  const missing = {};

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) {
      results.push(ch); // no chino
      continue;
    }

    const data = localChars[ch];

    if (data) {
      results.push(
        `${ch} (${data.pinyin}) → ${lang === "es" ? data.meaning_es : data.meaning_en}`
      );
    } else {
      // No encontrado
      results.push(`${ch} not found`);
      missing[ch] = {
        pinyin: "XXX",
        meaning_en: "----",
        meaning_es: "-----",
        radical: "X",
        strokes: 99,
        frequency: 999,
        components: ["X", "X"],
      };
    }
  }

  // mostrar resultados en pantalla
  renderOutput(results);

  // log para debugging → ver qué falta
  console.log("❌ Carácteres no encontrados:", missing);

  return missing;
}
