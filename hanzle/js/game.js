const Game = {
  words: [],
  solution: "",
  row: 0,
  col: 0,
  board: [],

  init(words) {
    this.words = words.filter(w => w.num == Settings.numLetters);
    this.solution = this.words[Math.floor(Math.random()*this.words.length)].nor;
    this.row = 0;
    this.col = 0;
    this.board = Array.from({length: Settings.numAttempts},
      () => Array(Settings.numLetters).fill(""));
    this.renderBoard();
  },

  addLetter(l) {
    if (this.col < Settings.numLetters) {
      this.board[this.row][this.col++] = l;
      this.renderBoard();
    }
  },

  backspace() {
    if (this.col > 0) {
      this.board[this.row][--this.col] = "";
      this.renderBoard();
    }
  },

  enter() {
    const guess = this.board[this.row].join("");
    if (!this.words.find(w => w.nor === guess)) {
      App.msg("❌ Word not in list");
      return;
    }
    this.checkGuess(guess);
  },

  checkGuess(guess) {
    const rowEl = document.querySelectorAll(".row")[this.row];
    [...guess].forEach((l,i)=>{
      if (l === this.solution[i]) rowEl.children[i].classList.add("correct");
      else if (this.solution.includes(l)) rowEl.children[i].classList.add("present");
      else rowEl.children[i].classList.add("absent");
    });

    if (guess === this.solution) App.win();
    else if (++this.row === Settings.numAttempts) App.lose();
    else this.col = 0;
  },

  renderBoard() {
    const b = document.getElementById("board");
    b.innerHTML = "";
    b.style.gridTemplateRows = `repeat(${Settings.numAttempts},1fr)`;

    this.board.forEach(r=>{
      const row = document.createElement("div");
      row.className = "row";
      row.style.gridTemplateColumns = `repeat(${Settings.numLetters},1fr)`;
      r.forEach(c=>{
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = c;
        row.appendChild(cell);
      });
      b.appendChild(row);
    });
  }
};
