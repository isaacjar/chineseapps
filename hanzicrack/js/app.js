// app.js
import { data } from "./data/chars.js";      // tu JSON principal
import { Settings } from "./settings.js";
import { initUI } from "./ui.js";
import { analyzeChar, fetchFromAPI, newChars } from "./analyzer.js";

window.data = data;      // para debug en consola
window.Settings = Settings;

// === Inicialización al cargar ===
window.addEventListener("DOMContentLoaded", () => {
  Settings.load();
  initUI();

  // Botón analizar
  const btnAnalyze = document.getElementById("analyzeBtn");
  btnAnalyze?.addEventListener("click", () => {
    const input = document.getElementById("inputText").value.trim();
    if (!input) return;

    const output = document.getElementById("outputBox");
    output.innerHTML = ""; // limpiar salida

    for (const char of input) {
      if (/\s/.test(char)) continue; // saltar espacios

      const line = analyzeChar(char, Settings.data.lang, Settings.data.mode);
      const div = document.createElement("div");
      div.innerHTML = line;
      output.appendChild(div);
    }
  });

  // Botón descargar JSON nuevo
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn?.addEventListener("click", () => {
    if (Object.keys(newChars).length === 0) {
      alert("⚠️ No hay caracteres nuevos para descargar.");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(newChars, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "new_chars.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});
