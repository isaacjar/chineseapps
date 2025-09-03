// debug.js
import { data as localChars } from "../data/chars.js";
import { getNewChars } from "./api.js"; // usamos mismo patrón de memoria
import { renderOutput } from "./ui.js";

let debugNewChars = {}; // aquí guardamos lo que falta

/** 
 * Analiza texto solo contra archivo local.
 * Los caracteres no encontrados se marcan como "not found"
 * y se guardan en memoria con la plantilla JSON.
 *
 * @param {string} text
 * @param {'simple'|'full'} mode
 * @param {'es'|'en'} lang
 * @returns {Promise<string[]>}
 */
export async function debugText(text, mode = "simple", lang = "en") {
  const lines = [];

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) continue;

    const data = localChars[ch];
    if (!data) {
      // no encontrado → guardamos plantilla
      lines.push(`${ch} not found`);
      debugNewChars[ch] = {
        pinyin: "XXX",
        meaning_en: "----",
        meaning_es: "-----",
        radical: "X",
        strokes: 99,
        frequency: 999,
        components: ["X", "X"],
      };
      continue;
    }

    // expandimos componentes según modo
    const finalComponents =
      mode === "simple" ? data.components : await explodeLocalToAtoms(data);

    const parts = finalComponents.map(c => {
      const cd = localChars[c];
      const cpinyin = cd?.pinyin || "";
      const cmeaning = cd ? (lang === "es" ? cd.meaning_es : cd.meaning_en) : "";
      return `${c} [${cpinyin}] ${cmeaning}`.trim();
    });

    const pinyin = data.pinyin || "";
    const right = parts.join(", ");
    lines.push(`${ch} [${pinyin}] ➜ ${right}`);
  }

  renderOutput(lines);
  return lines;
}

/**
 * FULL: explota recursivamente hasta átomos en chars locales
 */
async function explodeLocalToAtoms(data, visiting = new Set()) {
  if (!data || !Array.isArray(data.components)) return [];
  const out = [];
  const seen = new Set();

  for (const comp of data.components) {
    if (visiting.has(comp)) continue;
    visiting.add(comp);

    const sub = localChars[comp];
    if (sub && sub.components?.length > 0) {
      const atoms = await explodeLocalToAtoms(sub, visiting);
      for (const a of atoms) {
        if (!seen.has(a)) {
          seen.add(a);
          out.push(a);
        }
      }
    } else {
      if (!seen.has(comp)) {
        seen.add(comp);
        out.push(comp);
      }
    }
    visiting.delete(comp);
  }
  return out;
}

/**
 * Devuelve los nuevos chars generados por debug.
 */
export function getDebugNewChars() {
  return debugNewChars;
}
