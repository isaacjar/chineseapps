// game3.js
const GameWord = {
  start(ctx) {
    console.log("Game: Word");

    this.ctx = ctx;
    this.words = [...ctx.vocab];
    this.nextTurn(1);
  },

  nextTurn(player) {
    const word = this.randomWord();
    const correct = word.hanzi;

    const options = this.buildOptions(correct);

    UI.renderQuestion(
      player,
      this.ctx.getMeaning(word),
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

  randomWord() {
    return this.words[Math.floor(Math.random() * this.words.length)];
  },

  buildOptions(correct) {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      opts.add(this.randomWord().hanzi);
    }

    return [...opts].map(h => {
      if (!this.ctx.showPinyin) return h;
      const w = this.words.find(x => x.hanzi === h);
      return `${h} [${w.pinyin}]`;
    }).sort(() => Math.random() - 0.5);
  }
};
