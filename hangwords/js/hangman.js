/* hangman.js — dibujo SVG del ahorcado (con efecto 3D ligero) */

const $ = id => document.getElementById(id);

/* ================= HANGMAN SVG ================= */
function updateHangmanSVG(stage) {
  const svg = $("hangmanSVG");
  if (!svg) return;
  svg.innerHTML = "";

  const line = (x1, y1, x2, y2, w, shadow = false) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    if (shadow) {
      l.setAttribute("x1", x1 + 2);
      l.setAttribute("y1", y1 + 2);
      l.setAttribute("x2", x2 + 2);
      l.setAttribute("y2", y2 + 2);
      l.setAttribute("stroke", "#999");
      l.setAttribute("stroke-width", w + 1);
    } else {
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
      l.setAttribute("stroke", "black");
      l.setAttribute("stroke-width", w);
    }
    svg.appendChild(l);
  };

  const circle = (cx, cy, r, w, shadow = false) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    if (shadow) {
      c.setAttribute("cx", cx + 2);
      c.setAttribute("cy", cy + 2);
      c.setAttribute("r", r);
      c.setAttribute("stroke", "#999");
      c.setAttribute("stroke-width", w + 1);
      c.setAttribute("fill", "#ddd");
    } else {
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
      c.setAttribute("r", r);
      c.setAttribute("stroke", "black");
      c.setAttribute("stroke-width", w);
      c.setAttribute("fill", "none");
    }
    svg.appendChild(c);
  };

  if (stage >= 1) { line(10, 190, 90, 190, 4, true); line(10, 190, 90, 190, 4); }
  if (stage >= 2) { line(50, 190, 50, 20, 4, true); line(50, 190, 50, 20, 4); }
  if (stage >= 3) { line(50, 20, 120, 20, 4, true); line(50, 20, 120, 20, 4); }
  if (stage >= 4) { line(120, 20, 120, 50, 3, true); line(120, 20, 120, 50, 3); }
  if (stage >= 5) { circle(120, 70, 20, 3, true); circle(120, 70, 20, 3); }
  if (stage >= 6) { line(120, 90, 120, 140, 3, true); line(120, 90, 120, 140, 3); }
  if (stage >= 7) { line(120, 110, 90, 90, 3, true); line(120, 110, 90, 90, 3); }
  if (stage >= 8) { line(120, 110, 150, 90, 3, true); line(120, 110, 150, 90, 3); }
  if (stage >= 9) { line(120, 140, 90, 170, 3, true); line(120, 140, 90, 170, 3); }
  if (stage >= 10) { line(120, 140, 150, 170, 3, true); line(120, 140, 150, 170, 3); }
}

/* Export global (sin módulos, compatible con tu app actual) */
window.updateHangmanSVG = updateHangmanSVG;
