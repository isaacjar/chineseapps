// game2.js
const GameMeaning = {
  mode: "meaning",

  start(ctx) {
    console.log("Game 2: Meaning");
    this.ctx = ctx;
    this.vocab = ctx.vocab || [];
    window.Game = this;          // 🔑 necesario para loadQuestion
  },

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
