// storage.js
// Manejo de almacenamiento local y descarga de JSON actualizado

import { getCharsData, loadCharsData } from "./analyzer.js";

const CHAR_FILE = "data/chars.json";

/**
 * Carga el JSON principal (chars.json) desde servidor/local.
 * Si ya hay una copia en localStorage, usa esa.
 */
export async function loadCharsJson() {
  try {
    const saved = localStorage.getItem("hanziChars");
    if (saved) {
      const data = JSON.parse(saved);
      loadCharsData(data);
      console.log("📂 chars.json cargado desde localStorage");
      return data;
    }

    const response = await fetch(CHAR_FILE);
    const data = await response.json();
    loadCharsData(data);
    console.log("📂 chars.json cargado desde archivo");
    return data;
  } catch (err) {
    console.error("❌ Error cargando chars.json:", err);
    return {};
  }
}

/**
 * Guarda el diccionario actual en localStorage.
 */
export function saveCharsJson() {
  const data = getCharsData();
  localStorage.setItem("hanziChars", JSON.stringify(data));
  console.log("💾 chars.json guardado en localStorage");
}

/**
 * Descarga el JSON actualizado como archivo local.
 */
export function downloadUpdatedJson() {
  const data = getCharsData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "chars_updated.json";
  a.click();

  URL.revokeObjectURL(url);
  console.log("⬇️ chars_updated.json descargado");
}
