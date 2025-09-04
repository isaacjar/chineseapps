// settings.js
// Gestión de configuración de la app (idioma, modo, permisos)
import { setMsg, closeModal } from "./ui.js";

let settings = {
  lang: "en",       // por defecto inglés
  mode: "simple",   // NO persistimos este valor
  admin: false
};

/**
 * Inicializa configuración:
 * - Detecta parámetro en URL (?Isaac120)
 * - Carga ajustes previos de localStorage
 */
export function initSettings() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("Isaac120")) {
    settings.admin = true;
    showHiddenControls();
  }

  // ⚙️ Cargar idioma y otros Settings si hay en el futuro
  const savedSettings = localStorage.getItem("hanziSettings");
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
  }

  applyUISettings();
}

/**
 * Devuelve objeto settings actual.
 */
export function getSettings() {
  return settings;
}

// setLanguage: actualiza pero NO guarda hasta pulsar Guardar
export function setLanguage(lang) {
  settings.lang = lang;
}

// setMode: NO persiste; solo actualiza settings en RAM
export function setMode(mode) {
  settings.mode = mode;
}

/**
 * Guarda configuración en localStorage.
 */
function saveSettings() {
  localStorage.setItem("hanziSettings", JSON.stringify(settings));
}

/**
 * Aplica configuración a la interfaz (ej: switch, select idioma).
 */
function applyUISettings() {
  // Select idioma
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.value = settings.lang; 
  }

  // Switch simple/full
  const modeSwitch = document.getElementById("modeSwitch");
  if (modeSwitch) {
    modeSwitch.checked = settings.mode === "full";
    modeSwitch.addEventListener("change", e => {
      setMode(e.target.checked ? "full" : "simple");
    });
  }

  // Botón Guardar
  const btnSave = document.getElementById("btnSaveSettings");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      if (langSelect) setLanguage(langSelect.value);
      saveSettings();
      setMsg("✅ Configuración guardada");
      closeModal("settingsModal");   // 👈 cerrar automáticamente
    });
  }
}

/**
 * Muestra botones ocultos si admin = true.
 */
function showHiddenControls() {
  document.getElementById("btnDownloadFull")?.classList.remove("hidden");
  document.getElementById("btnDownloadNew")?.classList.remove("hidden");
  document.getElementById("btnDebug")?.classList.remove("hidden");
  document.querySelector(".btnValidate")?.classList.remove("hidden");
  document.querySelector(".switch")?.classList.remove("hidden");
  setMsg("🐛 Debug mode on");
}
