const Game1 = {
  mode: "hanzi-to-pinyin",

  vocab: [
    { hanzi: "你好", pinyin: "nǐ hǎo" },
    { hanzi: "谢谢", pinyin: "xièxie" },
    { hanzi: "再见", pinyin: "zài jiàn" },
    { hanzi: "请", pinyin: "qǐng" },
    { hanzi: "对不起", pinyin: "duìbuqǐ" },
    { hanzi: "没关系", pinyin: "méi guānxi" }
  ],

  getQuestion() {
    return this.vocab[Math.floor(Math.random() * this.vocab.length)];
  }
};
