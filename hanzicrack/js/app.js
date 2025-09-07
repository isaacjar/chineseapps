// ✅ app.js
// Punto de entrada de la aplicación
import { initSettings, getSettings } from "./settings.js";
import { saveCharsJson, getCharsData } from "./storage.js";  
import { analyzeText } from "./analyzer.js";
import { renderOutput, setMsg, openModal, closeModal, showModalRadicals, highlightCharacters } from "./ui.js";
import { downloadNewCharsJSON } from "./api.js";
import { debugText } from "./debug.js"; 
import { showStrokes } from "./strokes.js";  // 👈 nuevo import

// ========= INICIO =========
window.addEventListener("DOMContentLoaded", async () => {

  // 1. Inicializar configuración
  initSettings();

  // 2. Conectar eventos
  setupEventListeners();

  setMsg("Ready 🚀");
  
});

// 🔹 Estado de modo (arranca siempre en "simple")
let currentMode = "simple";

// ========= EVENTOS =========
function setupEventListeners() {
  const btnAnalyze = document.getElementById("btnAnalyze");
  const btnRadical = document.getElementById("btnRadical");
  const btnDownloadFull = document.getElementById("btnDownloadFull");
  const btnDownloadNew = document.getElementById("btnDownloadNew");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const btnCloseRadical = document.getElementById("btnCloseRadical");
  const btnValidate = document.getElementById("btnValidate");
  const btnStrokes = document.getElementById("btnStrokes");
  const modeSwitch = document.getElementById("modeSwitch");

  // 🧠 SWITCH BUSQUEDA PROFUNDA
  if (modeSwitch) {
    // siempre arranca desactivado → simple
    modeSwitch.checked = false;

    modeSwitch.addEventListener("change", e => {
      currentMode = e.target.checked ? "full" : "simple";
      //console.log("🔄 Mode switched to:", currentMode);
    });
  }
  
  // Analizar texto
  btnAnalyze?.addEventListener("click", async () => {
    const input = document.getElementById("inputText").value.trim();
    if (!input) {
      setMsg("Type Chinese chars...");
      return;
    }
  
    const outputDiv = document.getElementById("outputText");
    outputDiv.innerHTML = ""; // Limpio contenido previo
    outputDiv.classList.add("loading"); // ⏳ mostrar spinner animado
  
    try {
      const { lang } = getSettings(); // usamos solo lang de settings
      const lines = await analyzeText(input, currentMode, lang);
      renderOutput(lines);
    } catch (err) {
      console.error("❌ Error analyzing text:", err);
      setMsg("Error during analysis");
    } finally {
      outputDiv.classList.remove("loading"); // ✅ quitar spinner
    }
  });

  // Debug
  document.getElementById("btnDebug").addEventListener("click", async () => {
    const input = document.getElementById("inputText").value.trim();
    if (!input) return;
    
    const { lang } = getSettings();
    await debugText(input, currentMode, lang);
    setMsg("Debug analysis done. Missing chars stored in memory ⚡");
  });
      
  // Buscar radical (abre modal)
  btnRadical?.addEventListener("click", () => {
    fetch("./data/radicals.json")
      .then(r => r.json())
      .then(radicals => {
        const { lang } = getSettings();
        showModalRadicals(radicals, lang, radical => {
          const text = document.getElementById("inputText").value || "";
          if (!text) return;
  
          const dict = getCharsData(); // local + nuevos en memoria
          const charsToHighlight = new Set();
          
          const rad = radical.radical;
          const variants = Array.isArray(radical.variants) && radical.variants.length > 0
          ? radical.variants
          : [];
  
          // conjunto de formas aceptadas (radical + variantes)
          const allForms = [rad, ...variants];
  
          for (const ch of text) {
            // solo caracteres Han
            if (!/\p{Script=Han}/u.test(ch)) continue;
  
            const d = dict[ch];
            if (d) {
              // Buscar en el campo "radical" (si existe)
              const hasRadicalField = d.radical && allForms.includes(d.radical);
              
              // Buscar en el campo "components" (si existe y es array)
              const hasInComponents = Array.isArray(d.components) && 
                                     allForms.some(form => d.components.includes(form));
              
              // Si se encuentra en cualquiera de los dos campos, añadir a resaltar
              if (hasRadicalField || hasInComponents) {
                charsToHighlight.add(ch);
              }
            }
          }
  
          const variantsStr = variants.length > 0 ? ` (${variants.join(", ")})` : "";
          highlightCharacters(text, charsToHighlight);
          setMsg(`Radical ${rad}${variantsStr} found in ${charsToHighlight.size} chars.`);
        });
      });
  });

  // Descargar JSON completo (local + nuevos)
  btnDownloadFull?.addEventListener("click", () => {
    saveCharsJson();
  });
  
  // Descargar solo los nuevos caracteres
  btnDownloadNew?.addEventListener("click", () => {
    downloadNewCharsJSON();
  });

  // Abrir configuración
  btnSettings?.addEventListener("click", () => {
    openModal("settingsModal");
  });

  // Cerrar configuración
  btnCloseSettings?.addEventListener("click", () => {
    closeModal("settingsModal");
  });

  // Cerrar modal radical
  btnCloseRadical?.addEventListener("click", () => {
    closeModal("radicalModal");
  });

  // Validar JSON de caracteres
  btnValidate?.addEventListener("click", () => {
    const dict = getCharsData(); // 🔹 tu acceso central a data (local + memoria)
  
    console.log("🔎 Validando diccionario...");
  
    const keys = Object.keys(dict);
    const seen = new Set();
    const duplicates = [];
    const missingComponents = [];
  
    // 1. Buscar duplicados
    for (const k of keys) {
      if (seen.has(k)) {
        duplicates.push(k);
      } else {
        seen.add(k);
      }
    }
  
    // 2. Verificar que todos los componentes existan
    for (const [char, data] of Object.entries(dict)) {
      if (Array.isArray(data.components)) {
        for (const comp of data.components) {
          if (!dict[comp]) {
            missingComponents.push({ char, comp });
          }
        }
      }
    }
  
    // 3. Mostrar resultados
    if (duplicates.length === 0 && missingComponents.length === 0) {
      console.log("✅ Validación completada: sin problemas.");
      alert("✅ Diccionario validado: todo correcto.");
    } else {
      if (duplicates.length > 0) {
        console.error("⚠️ Claves duplicadas:", duplicates);
      }
      if (missingComponents.length > 0) {
        console.error("⚠️ Componentes no encontrados:", missingComponents);
      }
      alert(`⚠️ Errores detectados: 
  - Duplicados: ${duplicates.length} 
  - Componentes faltantes: ${missingComponents.length}`);
    }
  });

  // Strokes
  btnStrokes?.addEventListener("click", () => {
    const input = document.getElementById("inputText").value.trim();
    showStrokes(input);
  });
}
