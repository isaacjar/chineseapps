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
    const item = this.vocab[Math.floor(Math.random() * this.vocab.length)];
    const correct = item.pinyin;

    // obtener opciones distintas posibles
    const otherOptions = this.vocab
      .filter(v => v.pinyin !== correct)
      .map(v => v.pinyin);

    // mezclar y tomar hasta 3 alternativas + la correcta
    const shuffled = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled, correct].sort(() => Math.random() - 0.5);

    return {
      text: item.hanzi,
      options,
      correct
    };
  }
};
