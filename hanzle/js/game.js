const Game = {
  words: [],
  solutionObj: null,     // palabra completa con todos los campos
  solution: "",          // palabra normalizada para el juego
  row: 0,
  col: 0,
  board: [],
  active: false,

  init(words) {
    this.words = words.filter(w => w.num === Settings.numLetters);
    if (this.words.length === 0) { App.msg("⚠️ No words with current length"); return; }

    this.solutionObj = this.words[Math.floor(Math.random() * this.words.length)];
    this.solution = this.solutionObj.nor;
    this.row = 0;
    this.col = 0;
    this.board = Array.from({ length: Settings.numAttempts }, () => Array(Settings.numLetters).fill(""));
    this.active = true;

    this.renderBoard();
    App.onGameStart();
  },

  addLetter(l) {
    if (!this.active) return;
    if (this.col < Settings.numLetters) {
      this.board[this.row][this.col++] = l;
      this.renderBoard();
    }
  },

  backspace() {
    if (!this.active) return;
    if (this.col > 0) {
      this.board[this.row][--this.col] = "";
      this.renderBoard();
    }
  },

  enter() {
    if (!this.active) return;
    const guess = this.board[this.row].join("");
    if (!this.words.find(w => w.nor === guess)) {
      App.onInvalidWord();
      this.shakeRow();
      return;
    }
    this.checkGuess(guess);
  },

  checkGuess(guess) {
    const rowEl = document.querySelectorAll(".row")[this.row];
    const letters = [...guess].map((l, i) => {
      let state = "absent";
      if (l === this.solution[i]) state = "correct";
      else if (this.solution.includes(l)) state = "present";
      return { char: l, state };
    });

    // animación secuencial tipo Wordle
    letters.forEach((l, i) => {
      const cell = rowEl.children[i];
      setTimeout(() => {
        cell.classList.add("flip");
        cell.classList.add(l.state);
        App.updateKey(l.char, l.state);
      }, i * 250);
    });

    // después de animación completa
    setTimeout(() => {
      const win = guess === this.solution;
      if (win) {
        this.active = false;
        this.fireworks();
        App.onWin(this.solutionObj);
      } else if (++this.row === Settings.numAttempts) {
        this.active = false;
        App.onLose(this.solutionObj);
      } else {
        this.col = 0;
      }
    }, letters.length * 250 + 100);
  },

  renderBoard() {
    const b = document.getElementById("board");
    b.innerHTML = "";
    b.style.gridTemplateRows = `repeat(${Settings.numAttempts},1fr)`;
    this.board.forEach(r => {
      const row = document.createElement("div");
      row.className = "row";
      row.style.gridTemplateColumns = `repeat(${Settings.numLetters},1fr)`;
      r.forEach(c => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = c;
        row.appendChild(cell);
      });
      b.appendChild(row);
    });
  },

  shakeRow() {
    const rowEl = document.querySelectorAll(".row")[this.row];
    rowEl.classList.add("shake");
    setTimeout(() => rowEl.classList.remove("shake"), 500);
  },

  fireworks() {
    const c = document.createElement("canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    c.style.position = "fixed";
    c.style.inset = "0";
    c.style.pointerEvents = "none";
    document.body.appendChild(c);

    const ctx = c.getContext("2d");
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: c.width / 2,
        y: c.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 60
      });
    }

    const anim = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
      });
      if (particles.some(p => p.life > 0)) requestAnimationFrame(anim);
      else c.remove();
    };
    anim();
  }
};
