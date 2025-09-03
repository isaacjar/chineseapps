// app.js
// Punto de entrada de la aplicación

import { initSettings, getSettings } from "./settings.js";
import { loadCharsJson, saveCharsJson, downloadUpdatedJson } from "./storage.js";
import { analyzeText } from "./analyzer.js";
import { renderOutput, setMsg, openModal, closeModal, showModalRadicals, highlightCharacters } from "./ui.js";

// ========= INICIO =========
window.addEventListener("DOMContentLoaded", async () => {
  // 1. Inicializar configuración
  initSettings();

  // 2. Cargar diccionario de caracteres
  await loadCharsJson();

  // 3. Conectar eventos
  setupEventListeners();

  setMsg("Listo para analizar 🚀");
});

// ========= EVENTOS =========
function setupEventListeners() {
  const btnAnalyze = document.getElementById("btnAnalyze");
  const btnRadical = document.getElementById("btnRadical");
  const btnDownload = document.getElementById("btnDownload");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("closeSettings");
  const btnCloseRadical = document.getElementById("closeModal");

  // Analizar texto
  btnAnalyze?.addEventListener("click", async () => {
    const input = document.getElementById("inputText").value.trim();
    if (!input) {
      setMsg("Introduce algún carácter para analizar");
      return;
    }

    const { mode } = getSettings();
    const lines = await analyzeText(input, mode);

    renderOutput(lines);
    saveCharsJson(); // Guardamos por si hubo caracteres nuevos
  });

  // Buscar radical (abre modal)
  btnRadical?.addEventListener("click", () => {
    fetch("./data/radicals.json")
      .then(r => r.json())
      .then(radicals => {
        const { lang } = getSettings();
        showModalRadicals(radicals, lang, radical => {
          const text = document.getElementById("inputText").value;
          if (!text) return;

          // Encontramos caracteres con ese radical
          const charsToHighlight = new Set();
          for (const ch of text) {
            // Chequeo simple: si el char contiene el radical en su JSON
            // (en versión extendida se haría recursivo con analyzer)
            // Aquí solo simulamos el resaltado
            if (radical && ch.includes(radical.radical)) {
              charsToHighlight.add(ch);
            }
          }

          highlightCharacters(text, charsToHighlight);
          setMsg(`Radical ${radical.radical} encontrado en ${charsToHighlight.size} caracteres`);
        });
      });
  });

  // Descargar JSON actualizado
  btnDownload?.addEventListener("click", () => {
    downloadUpdatedJson();
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
}
