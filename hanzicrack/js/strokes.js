// strokes.js
import { setMsg } from "./ui.js";

export async function showStrokes(text) {
  if (!text) {
    setMsg("Type Chinese chars...");
    return;
  }

  const output = document.getElementById("outputText");
  if (!output) return;
  output.innerHTML = ""; // limpiamos antes

  for (const ch of text) {
    if (!/\p{Script=Han}/u.test(ch)) continue; // solo caracteres chinos

    try {
      const data = await HanziWriter.loadCharacterData(ch);

      const charBox = document.createElement("div");
      charBox.style.display = "inline-block";
      charBox.style.margin = "10px";
      charBox.style.textAlign = "center";

      // Nombre del carácter arriba
      const title = document.createElement("div");
      title.textContent = ch;
      title.style.fontSize = "20px";
      charBox.appendChild(title);

      // Añadir los strokes como SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100");
      svg.setAttribute("height", "100");
      svg.setAttribute("viewBox", "0 0 1024 1024");

      data.strokes.forEach(pathStr => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathStr);
        path.setAttribute("stroke", "black");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "3");
        svg.appendChild(path);
      });

      charBox.appendChild(svg);
      output.appendChild(charBox);
    } catch (err) {
      console.error("Stroke error:", err);
      setMsg(`❌ Error loading strokes for ${ch}`);
    }
  }

  setMsg("Stroke decomposition done 🎨");
}
