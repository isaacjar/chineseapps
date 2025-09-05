// analyzer.js - Con límite de 3 subniveles
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
  const seen = new Set();

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) continue;
    if (seen.has(ch)) continue;
    seen.add(ch);

    const data = await getCharacterData(ch);
    if (!data) {
      lines.push(`${ch} ➜ (sin datos)`);
      continue;
    }

    // Verificar si el carácter es un radical o si no tiene componentes
    const isRadical = data.radical === ch;
    
    if (isRadical || !data.components || data.components.length === 0) {
      const pinyin = Array.isArray(data.pinyin)
        ? data.pinyin.join(", ")
        : (data.pinyin || "");
      
      const meaning = lang === "es" 
        ? (Array.isArray(data.meaning_es) ? data.meaning_es.join(", ") : data.meaning_es)
        : (Array.isArray(data.meaning_en) ? data.meaning_en.join(", ") : data.meaning_en);
      
      const charSpan = data.source === "api"
        ? `<span class="from-api">${ch}</span>`
        : ch;
      
      lines.push(`${charSpan} [${pinyin}] <span class="meaning">${meaning}</span>`);
      continue;
    }

    // Obtener componentes finales según modo
    const finalComponents = await expandComponentsList(data.components, mode);

    // Formatear "comp [pinyin] meaning" con clases CSS
    const parts = [];
    for (const c of finalComponents) {
      const cd = await getCharacterData(c);

      const cpinyin = Array.isArray(cd?.pinyin)
        ? cd.pinyin.join(", ")
        : (cd?.pinyin || "");

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

      parts.push(
        `${cSpan} <span class="pinyin">[${cpinyin}]</span> <span class="meaning">${cmeaning}</span>`.trim()
      );
    }

    const pinyin = Array.isArray(data.pinyin)
      ? data.pinyin.join(", ")
      : (data.pinyin || "");
    const right = parts.map(p => p.trim()).join(" + ");

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
 * - full: descompone recursivamente hasta componentes atómicos (sin subcomponentes)
 */
async function expandComponentsList(firstLevel, mode) {
  if (!Array.isArray(firstLevel) || firstLevel.length === 0) return [];

  if (mode === "simple") {
    return firstLevel;
  }

  // FULL: expandir recursivamente hasta componentes atómicos con límite de 3 niveles
  const atomicComponents = [];
  
  for (const comp of firstLevel) {
    const atoms = await explodeToAtoms(comp, 0, 3); // Nivel inicial 0, máximo 3
    atomicComponents.push(...atoms);
  }

  return [...new Set(atomicComponents)]; // Eliminar duplicados
}

/**
 * Devuelve los componentes atómicos (sin subcomponentes)
 * @param {string} char - Carácter a descomponer
 * @param {number} currentLevel - Nivel actual de recursión
 * @param {number} maxLevel - Nivel máximo de recursión permitido
 */
async function explodeToAtoms(char, currentLevel = 0, maxLevel = 3) {
  // Mecanismo de seguridad: no superar el máximo de niveles
  if (currentLevel >= maxLevel) {
    return [char];
  }

  const data = await getCharacterData(char);
  
  // Si no tiene datos o no tiene componentes, es atómico
  if (!data || !Array.isArray(data.components) || data.components.length === 0) {
    return [char];
  }

  // Si tiene componentes, expandir recursivamente (aumentando el nivel)
  const atoms = [];
  for (const subComp of data.components) {
    const subAtoms = await explodeToAtoms(subComp, currentLevel + 1, maxLevel);
    atoms.push(...subAtoms);
  }
  
  return atoms;
}
