// game2.js
const GameMeaning = {
  mode: "hanzi-to-meaning",

  start(ctx) {
    this.ctx = ctx;
    this.vocab = ctx.vocab;

    window.Game = this;
  },

  getQuestion() {
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
