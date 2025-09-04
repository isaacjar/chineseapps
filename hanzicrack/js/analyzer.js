// ✅ analyzer.js mejorado
import { getCharacterData } from "./api.js";

/**
 * Devuelve líneas formateadas:
 * "字 [pinyin] ➜ comp [pinyin] meaning, comp [pinyin] meaning"
 * @param {string} text
 * @param {'simple'|'full'} mode
 * @param {'es'|'en'} lang
 * @returns {Promise<string[]>}
 */
export async function analyzeText(text, mode = "simple", lang = "en") {
  const lines = [];

  for (const ch of text) {
    // Solo tratamos caracteres Han; ignoramos espacios/puntuación/latinos
    if (!/\p{Script=Han}/u.test(ch)) continue;

    const data = await getCharacterData(ch);
    if (!data) {
      lines.push(`${ch} ➜ (sin datos)`);
      continue;
    }

    // 1) Obtener componentes finales según modo
    const finalComponents = await expandComponentsList(data.components, mode);

    // 2) Formatear "comp [pinyin] meaning"
    const parts = [];
    for (const c of finalComponents) {
      const cd = await getCharacterData(c);

      // 🔹 Normalizar pinyin
      const cpinyin = Array.isArray(cd?.pinyin)
        ? cd.pinyin.join(", ")
        : (cd?.pinyin || "");

      // 🔹 Normalizar significado en función del idioma
      let cmeaning = "";
      if (cd) {
        if (lang === "es") {
          cmeaning = Array.isArray(cd.meaning_es)
            ? cd.meaning_es.join(", ")
            : cd.meaning_es;
        } else {
          cmeaning = Array.isArray(cd.meaning_en)
            ? cd.meaning_en.join(", ")
            : cd.meaning_en;
        }
      }

      const cSpan = cd?.source === "api"
        ? `<span class="from-api">${c}</span>`
        : c;
      parts.push(`${cSpan} [${cpinyin}] ${cmeaning}`.trim());

    }

    // 3) Línea final
    const pinyin = Array.isArray(data.pinyin)
      ? data.pinyin.join(", ")
      : (data.pinyin || "");
    const right = parts.join(", ");
    // Si viene de API → en rojo
    const charSpan = data.source === "api"
      ? `<span class="from-api">${ch}</span>`
      : ch;
    
    lines.push(`${charSpan} [${pinyin}] ➜ ${right}`);
  }

  return lines;
}

/**
 * Según el modo, devuelve:
 * - simple: los componentes de primer nivel tal cual
 * - full: descompone recursivamente cada componente en átomos
 */
async function expandComponentsList(firstLevel, mode) {
  if (!Array.isArray(firstLevel) || firstLevel.length === 0) return [];

  if (mode === "simple") {
    // Primer nivel sin profundizar
    return firstLevel;
  }

  // FULL: expandir recursivamente hasta átomos, preservando orden
  const out = [];
  const seen = new Set();

  for (const comp of firstLevel) {
    const atoms = await explodeToAtoms(comp, new Set());
    for (const a of atoms) {
      if (!seen.has(a)) {
        seen.add(a);
        out.push(a);
      }
    }
  }

  return out;
}

/**
 * Devuelve los átomos de un componente.
 * Si el componente tiene subcomponentes → expandir recursivamente;
 * si no, devolver [componente].
 */
async function explodeToAtoms(char, visiting) {
  if (visiting.has(char)) return []; // evita bucles raros
  visiting.add(char);

  const d = await getCharacterData(char);
  const subs = d?.components;

  if (Array.isArray(subs) && subs.length > 0) {
    const acc = [];
    for (const s of subs) {
      const atoms = await explodeToAtoms(s, visiting);
      acc.push(...atoms);
    }
    visiting.delete(char);
    return acc; // devolvemos en orden
  } else {
    visiting.delete(char);
    return [char];
  }
}
