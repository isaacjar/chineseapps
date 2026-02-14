// game2.js
const GameMeaning = {
  mode: "meaning", // app.js lo detecta
  vocab: [],                // se llena desde app.js

  start(ctx) {
    this.vocab = ctx.vocab;
    this.ctx = ctx;
  },

  getQuestion() {
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
