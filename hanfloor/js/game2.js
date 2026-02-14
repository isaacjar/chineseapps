// game2.js
const GameMeaning = {
  mode: "hanzi-to-meaning", // 🔥 CLAVE: debe coincidir con app.js

  start(ctx) {
    console.log("Game 2: Meaning");
    this.ctx = ctx;
    this.vocab = ctx.vocab || [];
    window.Game = this; // 🔑 requerido por loadQuestion()
  },

  getQuestion() {
    if (!this.vocab.length) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
