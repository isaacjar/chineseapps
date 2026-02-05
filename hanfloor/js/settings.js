const DEFAULTS = {
  lang: "es",
  time: 45,
  penal: 3,
  pinyin: true,
  jugador1: "Player 1",
  jugador2: "Player 2"
};

const Settings = {
  load() {
    const url = new URLSearchParams(window.location.search);
    const stored = JSON.parse(localStorage.getItem("hanfloorSettings") || "{}");

    this.data = {
      ...DEFAULTS,
      ...stored,
      ...Object.fromEntries(url.entries())
    };

    this.data.time = Number(this.data.time);
    this.data.penal = Number(this.data.penal);
    this.data.pinyin = this.data.pinyin !== "false";
  },

  save() {
    localStorage.setItem("hanfloorSettings", JSON.stringify(this.data));
  }
};
