// settings.js
// Gestión de configuración de la app (idioma, modo, permisos)

let settings = {
  lang: "en",       // Idioma por defecto: inglés
  mode: "simple",   // simple | full
  admin: false      // acceso avanzado con Isaac120
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

  const saved = localStorage.getItem("hanziSettings");
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
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
 * Cambia idioma.
 * @param {string} lang - "en" | "es"
 */
export function setLanguage(lang) {
  settings.lang = lang;
  saveSettings();
}

/**
 * Cambia modo simple/full.
 * @param {"simple"|"full"} mode
 */
export function setMode(mode) {
  settings.mode = mode;
  saveSettings();
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
  document.getElementById("btnRadical")?.classList.remove("hidden");
  document.getElementById("btnDownload")?.classList.remove("hidden");
  document.querySelector(".switch")?.classList.remove("hidden");
}
