// ui.js

import { analyzeText } from "./analyzer.js"; 
import { Settings } from "./settings.js";

// Inicialización UI
export function initUI() {
  const analyzeBtn   = document.getElementById("analyzeBtn");
  const downloadBtn  = document.getElementById("downloadBtn");
  const radicalBtn   = document.getElementById("radicalBtn");
  const modeSwitch   = document.getElementById("modeSwitch");
  const modeLabel    = document.getElementById("modeLabel");

  // Botón Analizar
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      const input = document.getElementById("inputText").value.trim();
      if (!input) return;
      const output = analyzeText(input, Settings.data.mode);
      document.getElementById("outputBox").innerHTML = output;
    });
  }

  // Botón Descargar JSON (sólo visible en modo Isaac120)
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const dataStr = JSON.stringify(window.charDB, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hanzi_data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Botón Buscar Radical (modo dev)
  if (radicalBtn) {
    radicalBtn.addEventListener("click", () => {
      // Aquí lanzaremos el modal de radicales
      alert("👉 Aquí se abrirá la ventana de radicales.");
    });
  }
