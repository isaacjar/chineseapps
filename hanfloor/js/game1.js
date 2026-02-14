const Game1 = {
  mode: "hanzi-to-pinyin",

  start(ctx) {
    console.log("Game 1: Pinyin");

    this.ctx = ctx;
    this.vocab = ctx.vocab;

    this.nextTurn(1);
  },

  nextTurn(player) {
    const word = this.getQuestion();
    const correct = word.pinyin;

    const options = this.buildOptions(correct);

    UI.renderQuestion(
      player,
      word.hanzi,
      options,
      (answer) => {
        if (answer === correct) {
          UI.playOk();
        } else {
          UI.playFail();
          UI.markFail(player);
        }
      }
    );
  },

  getQuestion() {
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  },

  buildOptions(correct) {
    const opts = new Set([correct]);

    while (opts.size < 4) {
      opts.add(this.getQuestion().pinyin);
    }

    return [...opts].sort(() => Math.random() - 0.5);
  }
};
