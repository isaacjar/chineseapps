// storage.js
import { getCharsData, downloadUpdatedJson } from "./api.js";

/**
 * Obtiene TODOS los caracteres (locales + nuevos).
 */
export function loadChars() {
  return getCharsData();
}

/**
 * Descarga el JSON actualizado (local + nuevos).
 */
export function saveChars() {
  downloadUpdatedJson();
}
