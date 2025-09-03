// app.js
import { data } from "./data/chars.js"; // tu JSON principal
import { Settings } from "./settings.js";

const input = document.getElementById("inputText");
const output = document.getElementById("outputText");
const btnAnalyze = document.getElementById("btnAnalyze");
const switchMode = document.getElementById("modeSwitch"); // Simple/Full

let newChars = {}; // donde iremos guardando los nuevos

/* === Función principal === */
btnAnalyze.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  output.innerHTML = ""; // limpiar
  for (const char of text) {
    if (/\s/.test(char)) continue; // saltar espacios

    const line = analyzeChar(char, Settings.data.lang, switchMode.checked);
    const div = document.createElement("div");
    div.innerHTML = line;
    output.appendChild(div);
  }
});

/* === Analizar carácter === */
function analyzeChar(ch, lang = "en", full = false) {
  const dict = data[ch];

  if (!dict) {
    fetchFromAPI(ch); // fallback si no existe
    return `${ch} ➜ (MakeMeAHanzi)`;
  }

  const pinyin = dict.pinyin ? `[${dict.pinyin}]` : "";
  const meaning = lang === "es" ? dict.meaning_es : dict.meaning_en;

  let comps = [];
  if (dict.components && dict.components.length > 0) {
    for (const c of dict.components) {
      const sub = data[c];
      if (!sub) {
        fetchFromAPI(c);
        comps.push(`${c} (?)`);
        continue;
      }
      if (full && sub.components && sub.components.length > 0) {
        // expandir recursivamente
        comps = comps.concat(
          sub.components.map(sc => {
            const scData = data[sc];
            if (scData) {
              const m = lang === "es" ? scData.meaning_es : scData.meaning_en;
              return `${sc} [${scData.pinyin}] ${m}`;
            }
            return `${sc} (?)`;
          })
        );
      } else {
        const m = lang === "es" ? sub.meaning_es : sub.meaning_en;
        comps.push(`${c} [${sub.pinyin}] ${m}`);
      }
    }
  }

  return `<b>${ch}</b> ${pinyin} ➜ ${comps.join(", ")}`;
}

/* === Fallback a MakeMeAHanzi === */
async function fetchFromAPI(ch) {
  try {
    const res = await fetch(`https://makemeahanzi.herokuapp.com/character/${ch}`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();

    // Generar estructura básica compatible con tu JSON
    const newEntry = {
      pinyin: json.pinyin || "",
      meaning_en: json.definition || "MakeMeAHanzi",
      meaning_es: "MakeMeAHanzi",
      radical: json.radical || "",
      strokes: json.strokes || 0,
      frequency: json.frequency || 0,
      components: json.decomposition ? json.decomposition.split("") : []
    };
    data[ch] = newEntry; // añadir al diccionario actual
    newChars[ch] = newEntry; // marcar para exportar

    console.log("Nuevo carácter añadido:", ch, newEntry);
  } catch (e) {
    console.error("Error con API:", e);
  }
}
