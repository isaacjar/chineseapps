const Game1 = {
  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" }
  ],
  currentItem: null,

  start() {
    this.nextQuestion();
  },

  nextQuestion() {
    this.currentItem =
      this.vocab[Math.floor(Math.random() * this.vocab.length)];

    const correct = this.currentItem.pinyin;
    const options = [correct];

    while (options.length < 4) {
      const rnd =
        this.vocab[Math.floor(Math.random() * this.vocab.length)].pinyin;
      if (!options.includes(rnd)) options.push(rnd);
    }

    UI.renderQuestion(
      currentPlayer,
      this.currentItem.hanzi,
      options.sort(),
      this.checkAnswer.bind(this)
    );
  },

  checkAnswer(answer) {
    if (answer === this.currentItem.pinyin) {
      UI.playOk();
      switchPlayer();
      this.nextQuestion(); // ✅ CLAVE
    } else {
      UI.playFail();
      UI.penalize(currentPlayer, Settings.data.penal);
      this.nextQuestion(); // sigue jugando el mismo
    }
  }
};
