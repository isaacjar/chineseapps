// ui.js 

const UI = {
  init() {
    // Cache DOM jugadores
    this.player1 = document.getElementById("player1");
    this.player2 = document.getElementById("player2");

    this.name1 = document.getElementById("name1");
    this.name2 = document.getElementById("name2");

    this.time1 = document.getElementById("time1");
    this.time2 = document.getElementById("time2");
    this.timeBtns = document.querySelectorAll(".time-btn");

    this.question1 = document.getElementById("question1");
    this.question2 = document.getElementById("question2");

    this.options1 = document.getElementById("options1");
    this.options2 = document.getElementById("options2");

    // Popup y secciones
    this.menuOverlay = document.getElementById("menuOverlay");
    this.menuBox = document.getElementById("menuBox");
    this.gameTypeBtns = document.querySelectorAll("#gameTypeSection .menu-btn");
    this.vocabSelect = document.getElementById("vocabSelect");
    this.player1Input = document.getElementById("player1Name");
    this.player2Input = document.getElementById("player2Name");
    this.btnStartGame = document.getElementById("btnStartGame");

    // Mostrar popup al pulsar START principal
    const btnStart = document.getElementById("btnStart");
    if (btnStart) btnStart.onclick = () => this.menuOverlay.classList.remove("hidden");

    // Restaurar últimas opciones guardadas
    const lastGame = localStorage.getItem("lastGame");
    if (lastGame) this.setActiveGameBtn(Number(lastGame));

    const lastVocab = localStorage.getItem("lastVocab");
    if (lastVocab && this.vocabSelect) this.vocabSelect.value = lastVocab;

    const lastP1 = localStorage.getItem("lastPlayer1");
    const lastP2 = localStorage.getItem("lastPlayer2");
    if (lastP1) this.player1Input.value = lastP1;
    if (lastP2) this.player2Input.value = lastP2;

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

  setActiveTimeBtn(time) {
    if (!this.timeBtns) return;
    this.timeBtns.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.time) === Number(time));
    });
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
  
    let current = Number(el.textContent);
    const target = Math.max(0, current - sec);
  
    // Clase visual de penalización
    el.classList.add("penalty");
  
    let steps = 0;
    const anim = setInterval(() => {
      current--;
      el.textContent = Math.max(0, current);
      steps++;
  
      if (current <= target || steps >= sec) {
        clearInterval(anim);
  
        // Asegurar valor final correcto
        el.textContent = target;
  
        // Volver a estado normal
        el.classList.remove("penalty");
      }
    }, 120); // velocidad del “tic tic tic”
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

    options.forEach(o => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = o;
      btn.onclick = () => cb(o);
      container.appendChild(btn);
    });
  },

  /* ======================
     POPUP AVANZADO
  ====================== */
  showMenu() {
    if (!this.menuOverlay) return;
    this.menuOverlay.classList.remove("hidden");
  },

  hideMenu() {
    if (!this.menuOverlay) return;
    this.menuOverlay.classList.add("hidden");
  },

  setActiveGameBtn(gameNumber) {
    this.gameTypeBtns.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.game) === gameNumber);
    });
  },

  /* ======================
     WIN POPUP
  ====================== */
  showWinPopup({ name, points }) {
    const overlay = document.createElement("div");
    overlay.className = "win-overlay";
  
    overlay.innerHTML = `
      <div class="win-box">
        <h2>🎉 Victory!</h2>
        <p><strong>${name}</strong></p>
        <p>Points: <strong>${points}</strong></p>
        <button>Accept</button>
      </div>
    `;
  
    overlay.querySelector("button").onclick = () => {
      overlay.remove();
      this.showMenu(); // volver a configuración
    };
  
    document.body.appendChild(overlay);
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
    alert(`🎉 ${p === 1 ? this.name1.textContent : this.name2.textContent} wins!`);
  },

  /* ======================
     GUARDAR OPCIONES
  ====================== */
  saveSettings(gameNumber, vocabKey, player1, player2) {
    localStorage.setItem("lastGame", gameNumber);
    localStorage.setItem("lastVocab", vocabKey);
    localStorage.setItem("lastPlayer1", player1);
    localStorage.setItem("lastPlayer2", player2);
  }
};
