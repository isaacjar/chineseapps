// game3.js
const GameWord = {
  mode: "meaning-to-hanzi", // necesario para app.js
  vocab: [], // se llenará desde app.js

  // Método requerido por app.js
  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  },

  start(ctx) {
    console.log("Game: Word");
    this.ctx = ctx;
    this.words = [...ctx.vocab];
    this.nextTurn(1);
  },

  nextTurn(player) {
    const word = this.randomWord();
    const correct = word.hanzi;

    const options = this.buildOptions(correct);

    let question = this.ctx.getMeaning(word);

    UI.renderQuestion(player, question, options, (answer) => {
      if (answer === correct) {
        UI.playOk();
        // siguiente turno o sumar puntos
      } else {
        UI.playFail();
        UI.markFail(player);
      }
    });
  },

  randomWord() {
    return this.words[Math.floor(Math.random() * this.words.length)];
  },

  buildOptions(correct) {
    const opts = new Set([correct]);
    while (opts.size < 4 && this.words.length > 0) {
      const w = this.randomWord();
      opts.add(w.hanzi);
    }
    return [...opts].sort(() => Math.random() - 0.5);
  }
};
