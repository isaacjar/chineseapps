const Game1 = {
  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" }
  ],
  used: [],

  init() {
    this.nextQuestion();
  },

  nextQuestion() {
    const item = this.vocab[Math.floor(Math.random() * this.vocab.length)];
    const options = [item.pinyin];

    while (options.length < 4) {
      const rnd = this.vocab[Math.floor(Math.random() * this.vocab.length)].pinyin;
      if (!options.includes(rnd)) options.push(rnd);
    }

    UI.renderQuestion(currentPlayer, item.hanzi, options.sort(), (answer) => {
      if (answer === item.pinyin) {
        UI.playOk();
        switchPlayer();
      } else {
        UI.playFail();
        UI.penalize(currentPlayer, Settings.data.penal);
        this.nextQuestion();
      }
    });
  }
};
