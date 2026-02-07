// ui.js
console.log("ui.js cargado");

const UI = {
  init() {
    // Cache DOM
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

    document.getElementById("btnStart").onclick = startGame;

    // Pinta nombres iniciales (URL / defaults)
    if (window.Settings?.data) {
      this.setNames(Settings.data);
      this.resetTimers(Settings.data.time);
    }

    console.log("UI listo");
  },

  setNames(s) {
    if (!s) return;
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

  setActive(p) {
    this.player1.classList.toggle("active", p === 1);
    this.player2.classList.toggle("active", p === 2);

    this.player1.classList.toggle("inactive", p !== 1);
    this.player2.classList.toggle("inactive", p !== 2);
  },

  renderQuestion(p, text, options, onSelect) {
    const q = p === 1 ? this.question1 : this.question2;
    const container = p === 1 ? this.options1 : this.options2;

    q.textContent = text;
    container.innerHTML = "";

    options.forEach(option => {
      const btn = document.createElement("div");
      btn.className = "option-btn";
      btn.textContent = option;
      btn.onclick = () => onSelect(option);
      container.appendChild(btn);
    });
  },

  playOk() {
    document.getElementById("soundOk")?.play();
  },

  playFail() {
    document.getElementById("soundFail")?.play();
  },

  showWinner(p) {
    const name = p === 1 ? this.name1.textContent : this.name2.textContent;
    alert(`🎉 ${name} gana!`);
  }
};
