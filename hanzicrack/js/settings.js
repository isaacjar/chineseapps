// settings.js
// Gestión de configuración de la app (idioma, modo, permisos)
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
  const savedLang = localStorage.getItem("hanziLang");
  if (savedLang) {
    settings.lang = savedLang;
  }

  applyUISettings();
}

/**
 * Devuelve objeto settings actual.
 */
export function getSettings() {
  return settings;
}

// setLanguage: al cambiar idioma, SÍ persistimos
export function setLanguage(lang) {
  settings.lang = lang;
  localStorage.setItem("hanziLang", lang);
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
    langSelect.addEventListener("change", e => setLanguage(e.target.value));
  }

  // Switch simple/full
  const modeSwitch = document.getElementById("modeSwitch");
  if (modeSwitch) {
    modeSwitch.checked = settings.mode === "full";
    modeSwitch.addEventListener("change", e => {
      setMode(e.target.checked ? "full" : "simple");
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
  document.querySelector(".switch")?.classList.remove("hidden");
}
