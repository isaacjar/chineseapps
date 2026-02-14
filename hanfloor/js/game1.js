// game1.js
const Game1 = {
  mode: "hanzi-to-pinyin", // coincide con app.js

  start(ctx) {
    this.ctx = ctx;
    this.vocab = ctx.vocab || []; // 🔹 evita undefined
    window.Game = this;           // 🔹 necesario para loadQuestion
  },

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
