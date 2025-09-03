// storage.js
import { data as localChars } from "../data/chars.js";
import { getNewChars } from "./api.js";

let charsData = { ...localChars };

/**
 * Devuelve todos los caracteres (locales + nuevos).
 */
export function getCharsData() {
  return { ...charsData, ...getNewChars() };
}

/**
 * Descarga un JSON con todos los caracteres (locales + nuevos).
 */
export function saveCharsJson() {
  const allChars = getCharsData();

  const blob = new Blob([JSON.stringify(allChars, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chars_updated.json";
  a.click();
  URL.revokeObjectURL(url);

  console.log("⬇️ chars_updated.json descargado");
}

