// game1.js
const Game1 = {
  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" }
  ],

  current: null,
  waitingAnswer: false,

  start() {
    this.nextQuestion();
  },

  getQuestion() {
    const item = this.vocab[Math.floor(Math.random() * this.vocab.length)];
    const correct = item.pinyin;
    const options = [correct];

    while (options.length < 4) {
      const rnd = this.vocab[Math.floor(Math.random() * this.vocab.length)].pinyin;
      if (!options.includes(rnd)) options.push(rnd);
    }

    // mezclar opciones
    options.sort(() => Math.random() - 0.5);

    return {
      text: item.hanzi,
      options,
      correct
    };
  },

  nextQuestion() {
    this.current = this.getQuestion();
    this.waitingAnswer = true;

    UI.renderQuestion(
      currentPlayer,
      this.current.text,
      this.current.options,
      (answer) => this.checkAnswer(answer)
    );
  },

  checkAnswer(answer) {
    if (!this.waitingAnswer) return;
    this.waitingAnswer = false;

    const isCorrect = answer === this.current.correct;

    if (isCorrect) {
      UI.playOk();
      switchPlayer();
    } else {
      UI.playFail();
      UI.penalize(currentPlayer, Settings.data.penalty);
    }

    // pequeña pausa para feedback visual/sonoro
    setTimeout(() => {
      this.nextQuestion();
    }, 300);
  }
};
