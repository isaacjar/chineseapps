const UI = {
  init() {
    document.getElementById("btnStart").onclick = startGame;
  },

  setNames(s) {
    name1.textContent = s.jugador1;
    name2.textContent = s.jugador2;
  },

  resetTimers(t) {
    time1.textContent = t;
    time2.textContent = t;
  },

  decreaseTime(p) {
    const el = document.getElementById(`time${p}`);
    el.textContent = Math.max(0, el.textContent - 1);
  },

  getTime(p) {
    return Number(document.getElementById(`time${p}`).textContent);
  },

  penalize(p, sec) {
    const el = document.getElementById(`time${p}`);
    el.textContent = Math.max(0, el.textContent - sec);
  },

  setActive(p) {
    player1.classList.toggle("active", p === 1);
    player2.classList.toggle("active", p === 2);
    player1.classList.toggle("inactive", p !== 1);
    player2.classList.toggle("inactive", p !== 2);
  },

  renderQuestion(p, text, options, cb) {
    document.getElementById(`question${p}`).textContent = text;
    const container = document.getElementById(`options${p}`);
    container.innerHTML = "";
    options.forEach(o => {
      const btn = document.createElement("div");
      btn.className = "option-btn";
      btn.textContent = o;
      btn.onclick = () => cb(o);
      container.appendChild(btn);
    });
  },

  playOk() { soundOk.play(); },
  playFail() { soundFail.play(); },

  showWinner(p) {
    alert(`🎉 ${document.getElementById(`name${p}`).textContent} gana!`);
  }
};
