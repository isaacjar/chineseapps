const Game = {
  words: [],
  solutionObj: null,
  solution: "",
  row: 0,
  col: 0,
  board: [], // Cada celda: {char:'a', state:'correct|present|absent|""'}
  active: false,

  init(words) {
    this.words = words.filter(w => w.num === Settings.numLetters);
    if (this.words.length === 0) {
      App.msg("⚠️ No words with current length");
      return;
    }

    // Inicializamos el mazo si no existe o está vacío
    if (!this.wordDeck || this.wordDeck.length === 0) {
      this.wordDeck = [...this.words];
    }

    // Elegimos una palabra aleatoria del mazo
    const index = Math.floor(Math.random() * this.wordDeck.length);
    this.solutionObj = this.wordDeck.splice(index, 1)[0]; // La eliminamos del mazo
    this.solution = this.solutionObj.nor;
    console.log("📝 ", this.solutionObj.pin);

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
      this.board[this.row][this.col] = { char: l, state: "" };
      this.col++;
      this.renderBoard();
    }
  },

  backspace() {
    if (!this.active) return;
    if (this.col > 0) {
      this.col--;
      this.board[this.row][this.col] = { char: "", state: "" };
      this.renderBoard();
    }
  },

  enter() {
    if (!this.active) return;
    const guess = this.board[this.row].map(c => c.char).join("");
    if (!this.words.find(w => w.nor === guess)) {
      App.onInvalidWord();
      this.shakeRow();
      return;
    }
    this.checkGuess(guess);
  },

  checkGuess(guess) {
    const letters = [...guess].map((l, i) => {
      let state = "absent";
      if (l === this.solution[i]) state = "correct";
      else if (this.solution.includes(l)) state = "present";
      // Guardamos el estado en el tablero
      this.board[this.row][i].state = state;
      return { char: l, state };
    });

    const rowEl = document.querySelectorAll(".row")[this.row];
    letters.forEach((l, i) => {
      const cell = rowEl.children[i];
      setTimeout(() => {
        cell.classList.add("flip");
        cell.classList.add(l.state);
        App.updateKey(l.char, l.state);
      }, i * 250);
    });

    setTimeout(() => {
      const win = guess === this.solution;
      if (win) {
        this.active = false;
        App.onWin(this.solutionObj);
        document.getElementById("btnNew").focus();
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
        cell.textContent = c.char;
        if (c.state) cell.classList.add(c.state); // Mantener color persistente
        row.appendChild(cell);
      });
      b.appendChild(row);
    });
  },

  shakeRow() {
    const rowEl = document.querySelectorAll(".row")[this.row];
    rowEl.classList.add("shake");
    setTimeout(() => rowEl.classList.remove("shake"), 500);
  }
};
