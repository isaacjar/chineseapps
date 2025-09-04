// debug.js
import { data as localChars } from "../data/chars.js";
import { renderOutput, setMsg } from "./ui.js";

/** 
 * Analiza texto solo contra archivo local.
 * Los caracteres no encontrados se marcan como "not found"
 */
export async function debugText(text, mode = "simple", lang = "en") {
  const lines = [];

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) continue;

    const data = localChars[ch];
    if (!data) {
      lines.push(`${ch} not found`);
      continue;
    }

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
  setMsg(`Debug: analizados ${lines.length} caracteres ⚡`);
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
 * Valida el JSON local:
 * - Detecta duplicados de claves
 * - Detecta errores de formato (pinyin, meanings, components)
 * - Detecta componentes repetidos
 * - Exporta un JSON descargable con los problemas
 */
export function validateChars() {
  const seen = new Set();
  const issues = [];

  for (const [char, entry] of Object.entries(localChars)) {
    if (seen.has(char)) {
      issues.push(`⚠️ Duplicado en JSON: ${char}`);
    }
    seen.add(char);

    if (!entry.pinyin) {
      issues.push(`❌ ${char} sin pinyin`);
    }
    if (!entry.meaning_en) {
      issues.push(`❌ ${char} sin meaning_en`);
    }
    if (!entry.meaning_es) {
      issues.push(`❌ ${char} sin meaning_es`);
    }
    if (!Array.isArray(entry.components)) {
      issues.push(`❌ ${char} components no es array`);
    } else {
      const compSeen = new Set();
      for (const c of entry.components) {
        if (compSeen.has(c)) {
          issues.push(`⚠️ ${char} tiene componente repetido: ${c}`);
        }
        compSeen.add(c);
      }
    }
  }

  if (issues.length === 0) {
    issues.push("✅ Todo correcto. Sin duplicados ni errores de formato.");
  }

  // Mostrar en pantalla
  renderOutput(issues);
  setMsg(`Validation: ${issues.length} resultado(s) encontrados 🧪`);

  // Descargar JSON con problemas si hay
  if (issues.length > 0 && !issues[0].startsWith("✅")) {
    const blob = new Blob([JSON.stringify(issues, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validation_issues.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return issues;
}
