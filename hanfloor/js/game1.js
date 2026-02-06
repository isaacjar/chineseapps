// game1.js

const Game1 = {
  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" }
  ],

  getQuestion() {
    const item =
      this.vocab[Math.floor(Math.random() * this.vocab.length)];

    const correct = item.pinyin;
    const options = [correct];

    while (options.length < 4) {
      const rnd =
        this.vocab[Math.floor(Math.random() * this.vocab.length)].pinyin;
      if (!options.includes(rnd)) options.push(rnd);
    }

    // mezclar opciones
    options.sort(() => Math.random() - 0.5);

    return {
      text: item.hanzi,
      options,
      correct
    };
  }
};
