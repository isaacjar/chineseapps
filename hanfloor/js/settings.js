// settings.js
const DEFAULTS = {
  lang: "es",
  time: 45,
  penalty: 3,
  pinyin: true,
  jugador1: "Player 1",
  jugador2: "Player 2"
};

const Settings = {
  data: {},

  load() {
    const url = new URLSearchParams(window.location.search);
    const stored = JSON.parse(localStorage.getItem("hanfloorSettings") || "{}");
    const urlData = Object.fromEntries(url.entries());
  
    this.data = {
      ...DEFAULTS,
      ...stored,
      ...urlData
    };
  
    // Validaciones
    this.data.time = Number(this.data.time);
    if (isNaN(this.data.time) || this.data.time < 20 || this.data.time > 90) {
      this.data.time = DEFAULTS.time;
    }
  
    this.data.penalty = Number(this.data.penalty);
    if (isNaN(this.data.penalty) || this.data.penalty < 0 || this.data.penalty > 10) {
      this.data.penalty = DEFAULTS.penalty;
    }
  
    this.data.pinyin = this.data.pinyin !== "false";
  
    this.data.jugador1 = String(this.data.jugador1 || DEFAULTS.jugador1);
    this.data.jugador2 = String(this.data.jugador2 || DEFAULTS.jugador2);
  
    console.log("Settings cargados:", this.data);
  },

  save() {
    localStorage.setItem("hanfloorSettings", JSON.stringify(this.data));
  }
};
