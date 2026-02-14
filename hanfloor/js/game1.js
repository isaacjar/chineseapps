const Game1 = {
  mode: "pinyin",

  start(ctx) {
    console.log("Game 1: Pinyin");

    this.ctx = ctx;
    this.vocab = ctx.vocab;

    window.Game = this;
  },

  getQuestion() {
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
