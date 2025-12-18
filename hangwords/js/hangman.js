/* hangman.js — Torre de bloques tipo cómic + animaciones finales */

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

function fall(el, delay = 0) {
  el.animate(
    [
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: "translateY(30px) rotate(15deg)", opacity: 0.8 },
      { transform: "translateY(60px) rotate(-10deg)", opacity: 0 }
    ],
    { duration: 600, easing: "ease-in", delay }
  );
}

function confetti(svg, count = 30) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 200;
    const y = Math.random() * 0;
    const size = Math.random() * 5 + 3;
    const color = ["#FFD700","#FF69B4","#00BFFF","#32CD32","#FF8C00"][Math.floor(Math.random()*5)];
    const piece = svgEl("circle", { cx: x, cy: y, r: size, fill: color });
    svg.appendChild(piece);
    piece.animate(
      [
        { transform: `translateY(0)`, opacity: 1 },
        { transform: `translateY(200px) rotate(${Math.random()*360}deg)`, opacity: 0 }
      ],
      { duration: 1500 + Math.random()*1000, easing: "ease-in" }
    );
  }
}

/* ================= MAIN DRAW ================= */
function updateHangmanSVG(stage, finalWin=false, finalLose=false) {
  const svg = $("hangmanSVG");
  if (!svg) return;

  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 200 260");

  const towerBaseY = 220;
  const blockWidth = 40;
  const blockHeight = 20;
  const blockSpacing = 4;
  const towerX = 80;

  const tower = svgEl("g");
  svg.appendChild(tower);

  const blocks = [];

  for (let i = 0; i < 10; i++) {
    const y = towerBaseY - i * (blockHeight + blockSpacing);
    const block = svgEl("rect", {
      x: towerX,
      y,
      width: blockWidth,
      height: blockHeight,
      rx: 5,
      ry: 5,
      fill: "#FFD966",
      stroke: "#333",
      "stroke-width": 2
    });
    tower.appendChild(block);
    blocks.push(block);
  }

  // Cuerpo tipo cara
  const faceGroup = svgEl("g");
  faceGroup.style.transformOrigin = "100px 40px";
  svg.appendChild(faceGroup);

  const head = svgEl("circle", { cx:100, cy:40, r:15, fill:"#FFCC99", stroke:"#333", "stroke-width":2 });
  faceGroup.appendChild(head);

  const eyeLeft = svgEl("circle", { cx:95, cy:36, r:2, fill:"#333" });
  const eyeRight = svgEl("circle", { cx:105, cy:36, r:2, fill:"#333" });
  faceGroup.appendChild(eyeLeft);
  faceGroup.appendChild(eyeRight);

  const mouth = svgEl("path", {
    d: "M93 44 Q100 50 107 44",
    fill: "none",
    stroke: "#333",
    "stroke-width": 2,
    "stroke-linecap": "round"
  });
  faceGroup.appendChild(mouth);

  /* ================= FALL / POP ================= */
  blocks.forEach((b, i) => {
    if (!finalWin && i < stage) fall(b, i*50);
    else popIn(b);
  });

  /* ================= FACE ANIMATIONS ================= */
  if (!finalWin && !finalLose && stage > 0) wobble(faceGroup);

  /* ================= FINAL WIN ================= */
  if (finalWin) {
    confetti(svg, 40);
    wobble(faceGroup);
  }

  /* ================= FINAL LOSE ================= */
  if (finalLose) {
    // todos los bloques caen
    blocks.forEach((b, i) => fall(b, i*50));
    // ojos cerrados
    svg.removeChild(eyeLeft);
    svg.removeChild(eyeRight);
    faceGroup.appendChild(svgEl("line", { x1:93, y1:36, x2:97, y2:36, stroke:"#333","stroke-width":2 }));
    faceGroup.appendChild(svgEl("line", { x1:103, y1:36, x2:107, y2:36, stroke:"#333","stroke-width":2 }));
    // boca triste
    mouth.setAttribute("d","M93 46 Q100 40 107 46");
  }
}

/* expose global */
window.updateHangmanSVG = updateHangmanSVG;
