// ui.js
// Funciones relacionadas con la interfaz de usuario

/**
 * Muestra las líneas de análisis en el cuadro de salida.
 * @param {string[]} lines - array de strings formateados.
 */
export function renderOutput(lines) {
  const output = document.getElementById("outputText");
  output.innerHTML = lines.join("<br>");
}

/**
 * Actualiza el mensaje superior (label msg).
 * @param {string} message
 */
export function setMsg(message) {
  const msg = document.getElementById("msg");
  msg.textContent = message;
}

/**
 * Abre un modal (radicales o configuración).
 * @param {string} modalId - id del modal (ej: "radicalModal")
 */
export function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

/**
 * Cierra un modal.
 * @param {string} modalId - id del modal
 */
export function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

/**
 * Renderiza la lista de radicales en el modal.
 * @param {Array} radicals - lista de objetos radical {radical, pinyin, meaning_es, meaning_en}
 * @param {string} lang - idioma seleccionado ("en" | "es")
 * @param {function} onSelect - callback al pulsar un radical
 */
export function showModalRadicals(radicals, lang, onSelect) {
  const container = document.getElementById("radicalList");
  container.innerHTML = "";

  radicals.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = `${r.radical} [${r.pinyin}] ${lang === "es" ? r.meaning_es : r.meaning_en}`;
    btn.addEventListener("click", () => {
      onSelect(r);
      closeModal("radicalModal");
    });
    container.appendChild(btn);
  });

  openModal("radicalModal");
}

/**
 * Resalta en el output los caracteres que contienen el radical.
 * @param {string} originalText - el texto que se analizó
 * @param {Set} charsToHighlight - conjunto de caracteres a resaltar
 */
export function highlightCharacters(originalText, charsToHighlight) {
  const output = document.getElementById("outputText");

  // Recorremos el texto y resaltamos los caracteres encontrados
  let highlighted = "";
  for (const ch of originalText) {
    if (charsToHighlight.has(ch)) {
      highlighted += `<span class="highlight">${ch}</span>`;
    } else {
      highlighted += ch;
    }
  }

  output.innerHTML = highlighted;
}
