/* hangman.js — Hangman cartoon + animaciones */

/* ================= HELPERS ================= */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function popIn(el) {
  el.style.transformOrigin = "center";
  el.animate(
    [
      { transform: "scale(0)", opacity: 0 },
      { transform: "scale(1.15)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 250, easing: "ease-out" }
  );
}

function wobble(el) {
  el.animate(
    [
      { transform: "rotate(0deg)" },
      { transform: "rotate(-3deg)" },
      { transform: "rotate(3deg)" },
      { transform: "rotate(0deg)" }
    ],
    { duration: 300, easing: "ease-in-out" }
  );
}

function shake(el) {
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-3px)" },
      { transform: "translateX(3px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 200 }
  );
}

/* ================= MAIN DRAW ================= */
function updateHangmanSVG(stage) {
  const svg = $("hangmanSVG");
  if (!svg) return;

  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 200 260");

  /* ===== GALLOWS (STATIC) ===== */
  const gallows = svgEl("g");
  gallows.append(
    svgEl("line", { x1: 20, y1: 230, x2: 140, y2: 230, stroke: "#7b5e57", "stroke-width": 10, "stroke-linecap": "round" }),
    svgEl("line", { x1: 60, y1: 230, x2: 60, y2: 30, stroke: "#7b5e57", "stroke-width": 10, "stroke-linecap": "round" }),
    svgEl("line", { x1: 60, y1: 30, x2: 140, y2: 30, stroke: "#7b5e57", "stroke-width": 10, "stroke-linecap": "round" }),
    svgEl("line", { x1: 140, y1: 30, x2: 140, y2: 55, stroke: "#444", "stroke-width": 4 })
  );
  svg.appendChild(gallows);

  /* ===== SHADOW (FAKE 3D) ===== */
  const shadow = svgEl("ellipse", { cx: 140, cy: 215, rx: 26, ry: 8, fill: "rgba(0,0,0,0.15)" });
  svg.appendChild(shadow);

  /* ===== BODY GROUP (ANIMATED) ===== */
  const body = svgEl("g");
  body.style.transformOrigin = "140px 80px";
  svg.appendChild(body);

  const add = el => { body.appendChild(el); popIn(el); };

  /* ===== HEAD ===== */
  if (stage >= 1) {
    add(svgEl("circle", { cx: 140, cy: 80, r: 22, fill: "#FFD9C9", stroke: "#333", "stroke-width": 3 }));
  }

  /* ===== EYES ===== */
  if (stage >= 2) {
    const eyesClosed = stage >= 9; // 👀 cerrar ojos al perder
    if (eyesClosed) {
      add(svgEl("line", { x1: 129, y1: 75, x2: 135, y2: 75, stroke: "#333", "stroke-width": 2, "stroke-linecap": "round" }));
      add(svgEl("line", { x1: 145, y1: 75, x2: 151, y2: 75, stroke: "#333", "stroke-width": 2, "stroke-linecap": "round" }));
    } else {
      add(svgEl("circle", { cx: 132, cy: 75, r: 3, fill: "#333" }));
      add(svgEl("circle", { cx: 148, cy: 75, r: 3, fill: "#333" }));
    }
  }

  /* ===== MOUTH ===== */
  if (stage >= 3) {
    const isSad = stage >= 7;
    add(svgEl("path", {
      d: isSad ? "M132 92 Q140 86 148 92" : "M132 88 Q140 94 148 88",
      fill: "none",
      stroke: "#333",
      "stroke-width": 3,
      "stroke-linecap": "round"
    }));
  }

  /* ===== BODY ===== */
  if (stage >= 4) add(svgEl("line", { x1: 140, y1: 102, x2: 140, y2: 155, stroke: "#333", "stroke-width": 4, "stroke-linecap": "round" }));
  if (stage >= 5) add(svgEl("line", { x1: 140, y1: 115, x2: 115, y2: 135, stroke: "#333", "stroke-width": 4, "stroke-linecap": "round" }));
  if (stage >= 6) add(svgEl("line", { x1: 140, y1: 115, x2: 165, y2: 135, stroke: "#333", "stroke-width": 4, "stroke-linecap": "round" }));
  if (stage >= 7) add(svgEl("line", { x1: 140, y1: 155, x2: 120, y2: 190, stroke: "#333", "stroke-width": 4, "stroke-linecap": "round" }));
  if (stage >= 8) add(svgEl("line", { x1: 140, y1: 155, x2: 160, y2: 190, stroke: "#333", "stroke-width": 4, "stroke-linecap": "round" }));

  /* ===== ANIMATIONS ===== */
  if (stage > 0 && stage < 9) wobble(body);
  if (stage >= 6 && stage < 9) shake(body);

  /* ===== FINAL LOSE ANIMATION ===== */
  if (stage >= 9) {
    body.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(25deg)" },
        { transform: "rotate(-20deg)" },
        { transform: "rotate(15deg)" }
      ],
      { duration: 1200, easing: "ease-in-out", iterations: Infinity }
    );
  }
}

/* expose global */
window.updateHangmanSVG = updateHangmanSVG;
