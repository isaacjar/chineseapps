// ui.js
console.log("ui.js cargado");

const UI = {
  init() {
    // Cache DOM jugadores
    this.player1 = document.getElementById("player1");
    this.player2 = document.getElementById("player2");

    this.name1 = document.getElementById("name1");
    this.name2 = document.getElementById("name2");

    this.time1 = document.getElementById("time1");
    this.time2 = document.getElementById("time2");

    this.question1 = document.getElementById("question1");
    this.question2 = document.getElementById("question2");

    this.options1 = document.getElementById("options1");
    this.options2 = document.getElementById("options2");

    // Botón start
    const btnStart = document.getElementById("btnStart");
    if (btnStart) btnStart.onclick = startGame;

    // Contenedor menú
    this.menuOverlay = document.getElementById("menuOverlay");
    this.menuBox = document.getElementById("menuBox");
    this.menuTitle = document.getElementById("menuTitle");
    this.menuOptions = document.getElementById("menuOptions");

    console.log("UI listo");
  },

  /* ======================
     NOMBRES Y TIEMPOS
  ====================== */
  setNames(s) {
    this.name1.textContent = s.jugador1 || "Player 1";
    this.name2.textContent = s.jugador2 || "Player 2";
  },

  resetTimers(t) {
    this.time1.textContent = t;
    this.time2.textContent = t;
  },

  decreaseTime(p) {
    const el = p === 1 ? this.time1 : this.time2;
    el.textContent = Math.max(0, Number(el.textContent) - 1);
  },

  getTime(p) {
    return Number(p === 1 ? this.time1.textContent : this.time2.textContent);
  },

  penalize(p, sec) {
    const el = p === 1 ? this.time1 : this.time2;
    el.textContent = Math.max(0, Number(el.textContent) - sec);
  },

  /* ======================
     JUGADOR ACTIVO
  ====================== */
  setActive(p) {
    this.player1.classList.toggle("active", p === 1);
    this.player2.classList.toggle("active", p === 2);
    this.player1.classList.toggle("inactive", p !== 1);
    this.player2.classList.toggle("inactive", p !== 2);
  },

  /* ======================
     PREGUNTAS
  ====================== */
  renderQuestion(p, text, options, cb) {
    const q = p === 1 ? this.question1 : this.question2;
    const container = p === 1 ? this.options1 : this.options2;

    q.textContent = text;
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr";
    container.style.gap = "12px";
    container.style.minHeight = "180px";

    options.forEach(o => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = o;
      btn.onclick = () => cb(o);
      container.appendChild(btn);
    });

    console.log(`Jugador ${p} opciones renderizadas:`, container.children.length);
  },

  /* ======================
     MENÚ POPUP
  ====================== */
  showMenu(title, options, onSelect) {
    if (!this.menuOverlay) return;

    this.menuTitle.textContent = title;
    this.menuOptions.innerHTML = "";

    options.forEach((label, index) => {
      const btn = document.createElement("button");
      btn.className = "menu-btn"; // usar clase CSS del menú
      btn.textContent = `${index + 1} - ${label}`;
      btn.onclick = () => {
        this.hideMenu();
        onSelect(index + 1, label);
      };
      this.menuOptions.appendChild(btn);
    });

    this.menuOverlay.classList.remove("hidden");
  },

  hideMenu() {
    if (this.menuOverlay) this.menuOverlay.classList.add("hidden");
  },

  /* ======================
     SONIDO Y FINAL
  ====================== */
  playOk() {
    const s = document.getElementById("soundOk");
    if (s) s.play();
  },

  playFail() {
    const s = document.getElementById("soundFail");
    if (s) s.play();
  },

  showWinner(p) {
    alert(`🎉 ${p === 1 ? this.name1.textContent : this.name2.textContent} gana!`);
  }
};
