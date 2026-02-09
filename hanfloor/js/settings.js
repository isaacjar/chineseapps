// settings.js
const DEFAULTS = {
  lang: "es",
  time: 45,
  penalty: 3,
  pinyin: true
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
  
    console.log("Settings cargados:", this.data);
  },

  save() {
    localStorage.setItem("hanfloorSettings", JSON.stringify(this.data));
  }
};
