// ui.js
// Funciones relacionadas con la interfaz de usuario

/**
 * Muestra las líneas de análisis en el cuadro de salida.
 * @param {string[]} lines - array de strings formateados.
 */
  export function renderOutput(lines) {
    const output = document.getElementById("outputText");
  
    if (!lines) {
      output.innerHTML = "<em>(Sin resultados)</em>";
      return;
    }
  
    // Si es array → lo unimos con saltos de línea
    if (Array.isArray(lines)) {
      output.innerHTML = lines.join("<br>");
      return;
    }
  
    // Si es objeto → lo mostramos bonito
    if (typeof lines === "object") {
      output.innerHTML = `<pre>${JSON.stringify(lines, null, 2)}</pre>`;
      return;
    }
  
    // Si es string u otro tipo → lo mostramos tal cual
    output.textContent = lines.toString();
  }

/**
 * Actualiza el mensaje superior (label msg).
 * @param {string} message
 */
export function setMsg(message) {
  const lblMsg = document.getElementById("msg");
  if (!lblMsg) return;
  lblMsg.textContent = message;
}

/**
 * Abre un modal (radicales o configuración).
 * @param {string} modalId - id del modal (ej: "radicalModal")
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.remove("hidden");
}

/**
 * Cierra un modal.
 * @param {string} modalId - id del modal
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.add("hidden");
}

/**
 * Renderiza la lista de radicales en el modal.
 * @param {Array} radicals - lista de objetos radical {radical, pinyin, meaning_es, meaning_en, variants?}
 * @param {string} lang - idioma seleccionado ("en" | "es")
 * @param {function} onSelect - callback al pulsar un radical
 */
export function showModalRadicals(radicals, lang, onSelect) {
  const container = document.getElementById("radicalList");
  if (!container) return;

  container.innerHTML = "";

  radicals.forEach(r => {
    const btnRadical = document.createElement("button");
    btnRadical.classList.add("radical-btn");
  
    const variants = r.variants && r.variants.length
      ? ` (${r.variants.join(", ")})`
      : "";
  
    btnRadical.innerHTML = `
      <span class="radical-symbol">${r.radical}</span>
      <span class="radical-variants">${variants}</span>
      <span class="radical-pinyin">[${r.pinyin}]</span>
      <span class="radical-meaning">${lang === "es" ? r.meaning_es : r.meaning_en}</span>
    `;
  
    btnRadical.addEventListener("click", () => {
      onSelect(r);
      closeModal("radicalModal");
    });
  
    container.appendChild(btnRadical);
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
  if (!output) return;

  let highlighted = "";
  for (const ch of originalText) {
    highlighted += charsToHighlight.has(ch)
      ? `<span class="highlight">${ch}</span>`
      : ch;
  }

  output.innerHTML = highlighted;
}
