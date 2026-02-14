// game1.js
const Game1 = {
  mode: "hanzi-to-pinyin",

  start(ctx) {
    console.log("Game 1: Pinyin");
    this.ctx = ctx;
    this.vocab = ctx.vocab || [];
    window.Game = this; // 🔑 requerido por loadQuestion()
  },

  getQuestion() {
    if (!this.vocab.length) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
