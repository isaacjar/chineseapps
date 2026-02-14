// game2.js
const GameMeaning = {
  start(ctx) {
    console.log("Game: Meaning");

    this.ctx = ctx;
    this.words = [...ctx.vocab];
    this.nextTurn(1);
  },

  nextTurn(player) {
    const word = this.randomWord();
    const correct = this.ctx.getMeaning(word);

    const options = this.buildOptions(correct);

    let question = word.hanzi;
    if (this.ctx.showPinyin) {
      question += ` [${word.pinyin}]`;
    }

    UI.renderQuestion(player, question, options, (answer) => {
      if (answer === correct) {
        UI.playOk();
        // siguiente turno o sumar puntos
      } else {
        UI.playFail();
        UI.markFail(player);
      }
    });
  },

  randomWord() {
    return this.words[Math.floor(Math.random() * this.words.length)];
  },

  buildOptions(correct) {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const w = this.randomWord();
      opts.add(this.ctx.getMeaning(w));
    }
    return [...opts].sort(() => Math.random() - 0.5);
  }
};
