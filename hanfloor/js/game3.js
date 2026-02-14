// game3.js
const GameWord = {
  mode: "hanzi-to-word",      // coincide con GAME_TYPES en app.js
  start(ctx) {
    console.log("Game 3: Word");
    this.ctx = ctx;
    this.vocab = ctx.vocab || []; // 🔹 nunca undefined
    window.Game = this;           // 🔹 necesario para loadQuestion
  },
  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};

// Opciones Word
function generateWordOptions(word) {
  const correct = word.meaning[GameController.lang]; // usar meaning según app.js
  let candidates = window.Game.vocab
    .filter(w => GameController.getMeaning(w) !== correct)
    .map(w => GameController.getMeaning(w));
  shuffleArray(candidates);
  return shuffleArray([correct, ...candidates.slice(0,3)]);
}
