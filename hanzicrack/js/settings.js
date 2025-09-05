// settings.js
// Gestión de configuración de la app (idioma, modo, permisos)
import { setMsg, closeModal } from "./ui.js";

let settings = {
  lang: "en",       // por defecto inglés
  admin: false,
  fontSize: 24      // tamaño de fuente por defecto
};

/**
 * Inicializa configuración:
 * - Detecta parámetro en URL (?Isaac120)
 * - Carga ajustes previos de localStorage
 * - Aplica idioma y tamaño de fuente
 */
export function initSettings() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("Isaac120")) {
    settings.admin = true;
    showHiddenControls();
  }

  // Cargar settings previos
  const savedSettings = localStorage.getItem("hanziSettings");
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
  } else {
    // Si no hay settings guardados, aseguramos tamaño por defecto
    settings.fontSize = 24;
  }

  applyUISettings();
}

/**
 * Devuelve objeto settings actual.
 */
export function getSettings() {
  return settings;
}

/**
 * Actualiza idioma (no guarda hasta pulsar Guardar)
 */
export function setLanguage(lang) {
  settings.lang = lang;
}

/**
 * Actualiza tamaño de fuente (no guarda hasta pulsar Guardar)
 */
export function setFontSize(size) {
  settings.fontSize = size;
}

/**
 * Guarda configuración en localStorage
 */
function saveSettings() {
  localStorage.setItem("hanziSettings", JSON.stringify(settings));
}

/**
 * Aplica configuración a la interfaz
 */
function applyUISettings() {
  // Select idioma
  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = settings.lang;

  // Select tamaño de fuente
  const fontSelect = document.getElementById("fontSizeSelect");
  if (fontSelect) fontSelect.value = settings.fontSize;

  // Función para aplicar tamaño de fuente a input/output
  function applyFontSize() {
    const input = document.getElementById("inputText");
    const output = document.getElementById("outputText");
    if (input) input.style.fontSize = settings.fontSize + "px";
    if (output) output.style.fontSize = settings.fontSize + "px";

    if (fontSelect) fontSelect.value = settings.fontSize;
  }

  // Ejecutar al cargar
  applyFontSize();

  // Listener para cambiar tamaño de fuente en tiempo real
  if (fontSelect) {
    fontSelect.addEventListener("change", () => {
      setFontSize(parseInt(fontSelect.value));
      applyFontSize();
    });
  }

  // Botón Guardar
  const btnSave = document.getElementById("btnSaveSettings");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      if (langSelect) setLanguage(langSelect.value);
      if (fontSelect) setFontSize(parseInt(fontSelect.value));
      saveSettings();
      closeModal("settingsModal"); // cerrar modal
      location.reload();           // recargar para aplicar globalmente
    });
  }
}

/**
 * Muestra botones ocultos si admin = true
 */
function showHiddenControls() {
  document.getElementById("btnDownloadFull")?.classList.remove("hidden");
  document.getElementById("btnDownloadNew")?.classList.remove("hidden");
  document.getElementById("btnDebug")?.classList.remove("hidden");
  document.querySelector(".btnValidate")?.classList.remove("hidden");
  document.querySelector(".switch")?.classList.remove("hidden");
  setMsg("🐛 Debug mode on");
}
