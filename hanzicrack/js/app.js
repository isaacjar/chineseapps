// ✅ app.js
// Punto de entrada de la aplicación
import { initSettings, getSettings } from "./settings.js";
import { saveCharsJson, getCharsData } from "./storage.js";  
import { analyzeText } from "./analyzer.js";
import { renderOutput, setMsg, openModal, closeModal, showModalRadicals, highlightCharacters } from "./ui.js";
import { downloadNewCharsJSON } from "./api.js";
import { debugText } from "./debug.js"; 

// ========= INICIO =========
window.addEventListener("DOMContentLoaded", async () => {

  // 1. Inicializar configuración
  initSettings();

  // 2. Conectar eventos
  setupEventListeners();

  setMsg("Ready 🚀");
  
});

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
  
  // Analizar texto
  btnAnalyze?.addEventListener("click", async () => {
    const input = document.getElementById("inputText").value.trim();
    if (!input) {
      setMsg("Type Chinese chars...");
      return;
    }

    const { mode, lang } = getSettings();
    const lines = await analyzeText(input, mode, lang);
    renderOutput(lines);
    
  });

    document.getElementById("btnDebug").addEventListener("click", async () => {
      const input = document.getElementById("inputText").value.trim();
      if (!input) return;
    
      const { mode, lang } = getSettings();
      await debugText(input, mode, lang);
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
  
          for (const ch of text) {
            // solo caracteres Han
            if (!/\p{Script=Han}/u.test(ch)) continue;
  
            const d = dict[ch];
            if (d && Array.isArray(d.components) && d.components.includes(rad)) {
              charsToHighlight.add(ch);
            }
          }
  
          // pinto el MISMO texto con chars en rojo si contienen el radical
          highlightCharacters(text, charsToHighlight);
          setMsg(`Radical ${rad} found in ${charsToHighlight.size} chars.`);
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
  
}
