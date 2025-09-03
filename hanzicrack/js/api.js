// api.js
import { data as localChars } from "../data/chars.js";

const MMH_DICT_URL = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const HW_CDN_BASE  = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/";

let newChars = {};
let dictMap = null;          // Map<char, entry>
let dictMapPromise = null;   // para evitar descargas duplicadas

/**
 * Obtiene datos de un carácter:
 * 1) cache localStorage → 2) JSON local → 3) MakeMeAHanzi + HanziWriter
 */
export async function getCharacterData(char) {
  // 1) cache
  const cached = localStorage.getItem(`char_${char}`);
  if (cached) {
    return { ...JSON.parse(cached), source: "cache" };
  }

  // 2) local
  if (localChars[char]) return localChars[char];
  if (localChars[char]) {
    return { ...localChars[char], source: "local" };
  }

  // 3) remoto
  const apiData = await fetchFromSources(char);
  if (apiData) {
    const enriched = { ...apiData, source: "api" };
    localStorage.setItem(`char_${char}`, JSON.stringify(enriched));
    newChars[char] = enriched;
    return enriched;
  }
  return null;
}

/** Devuelve el diccionario de nuevos caracteres obtenidos en esta sesión */
export function getNewChars() {
  return newChars;
}

/** Descarga un JSON solo con los nuevos caracteres */
export function downloadNewCharsJSON() {
  if (!Object.keys(newChars).length) {
    alert("No hay nuevos caracteres para guardar.");
    return;
  }
  const blob = new Blob([JSON.stringify(newChars, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "new_chars.json";
  a.click();
  URL.revokeObjectURL(url);
  console.log("⬇️ new_chars.json descargado");
}

/* ================== Helpers ================== */

async function fetchFromSources(char) {
  const dict = await loadDict();
  const entry = dict && dict.get(char);
  if (!entry) return null;

  const pinyin = Array.isArray(entry.pinyin) ? entry.pinyin.join(" / ") : (entry.pinyin || "");
  const meaning_en = entry.definition || "MakeMeAHanzi";
  const radical = entry.radical || "";
  const components = extractAtomicComponents(entry.decomposition);
  const strokes = await fetchStrokeCount(char);

  return {
    pinyin,
    meaning_en,
    meaning_es: "MakeMeAHanzi", // la API no da español
    radical,
    strokes,
    frequency: 0,
    components
  };
}

/** Carga y parsea dictionary.txt una sola vez a Map<char, entry> */
async function loadDict() {
  if (dictMap) return dictMap;
  if (!dictMapPromise) {
    dictMapPromise = fetch(MMH_DICT_URL)
      .then(r => {
        if (!r.ok) throw new Error("No se pudo descargar dictionary.txt");
        return r.text();
      })
      .then(txt => {
        const map = new Map();
        const lines = txt.split(/\r?\n/);
        for (const line of lines) {
          const t = line.trim();
          if (!t || t[0] !== "{") continue;
          try {
            const obj = JSON.parse(t);
            if (obj.character) map.set(obj.character, obj);
          } catch {
            // saltar líneas malformadas
          }
        }
        dictMap = map;
        return dictMap;
      })
      .catch(err => {
        console.error("❌ Error cargando dictionary.txt:", err);
        dictMap = null;
        return null;
      });
  }
  return dictMapPromise;
}

/** Pide el JSON de hanzi-writer-data y devuelve strokes.length */
async function fetchStrokeCount(char) {
  try {
    const url = `${HW_CDN_BASE}${encodeURIComponent(char)}.json`;
    const resp = await fetch(url);
    if (!resp.ok) return 0;
    const j = await resp.json();
    return Array.isArray(j.strokes) ? j.strokes.length : 0;
  } catch {
    return 0;
  }
}

/** Operadores IDS que no son componentes "visibles" */
const IDS_OPS = new Set(["⿰","⿱","⿴","⿵","⿶","⿷","⿸","⿹","⿺","⿻","⿲","⿳"]);

/**
 * Extrae solo los componentes atómicos visibles de la cadena de descomposición.
 * (Filtra operadores IDS, espacios, dígitos y ASCII; preserva el orden y deduplica)
 */
function extractAtomicComponents(decomposition) {
  if (!decomposition) return [];
  const out = [];
  for (const ch of decomposition) {
    if (IDS_OPS.has(ch)) continue;
    if (/\s|\d|[A-Za-z]/.test(ch)) continue;
    out.push(ch);
  }
  return Array.from(new Set(out));
}
