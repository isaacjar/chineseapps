const Game1 = {
  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" },
    { hanzi: "请", pinyin: "qǐng" },
    { hanzi: "对不起", pinyin: "duìbuqǐ" },
    { hanzi: "没关系", pinyin: "méi guānxi" }
  ],

  getQuestion() {
    if (!this.vocab || this.vocab.length === 0) return null;

    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
