// game3.js
const GameWord = {
  mode: "word",
  vocab: [],
  start(ctx) { this.ctx = ctx; loadQuestion(); },
  getQuestion() { return this.vocab[Math.floor(Math.random()*this.vocab.length)]; }
};

function generateWordOptions(word) {
  const correct = word.hanzi;
  let candidates = window.Game.vocab.filter(w => w.hanzi !== correct).map(w => w.hanzi);
  shuffleArray(candidates);
  return shuffleArray([correct, ...candidates.slice(0,3)]);
}
