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
    // 1. Elegir palabra base
    const item = this.vocab[Math.floor(Math.random() * this.vocab.length)];
    const correct = item.pinyin;
    const charLength = item.hanzi.length;
  
    // 2. Filtrar vocabulario por número de caracteres
    let sameLengthVocab = this.vocab.filter(
      v => v.hanzi.length === charLength
    );
  
    // 3. Si no hay suficientes palabras, usar todo el vocabulario
    if (sameLengthVocab.length < 4) {
      sameLengthVocab = this.vocab;
    }
  
    // 4. Obtener opciones incorrectas
    const otherOptions = sameLengthVocab
      .filter(v => v.pinyin !== correct)
      .map(v => v.pinyin);
  
    // 5. Mezclar y crear opciones
    const shuffled = otherOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  
    const options = [...shuffled, correct]
      .sort(() => Math.random() - 0.5);
  
    return {
      text: item.hanzi,   // 👈 se muestra el carácter chino
      options,            // 👈 pinyin
      correct
    };
  }

};
