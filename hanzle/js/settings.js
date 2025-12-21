const Settings = {
  lang: "en",
  numLetters: 5,
  numAttempts: 6,
  voclist: null,

  load() {
    const p = new URLSearchParams(location.search);
    this.lang = p.get("lang") || localStorage.lang || "en";
    this.numLetters = +p.get("numlet") || +localStorage.numLetters || 5;
    this.numAttempts = +p.get("numint") || +localStorage.numAttempts || 6;
    this.voclist = p.get("voclist") || localStorage.voclist || null;
  },

  save() {
    localStorage.lang = this.lang;
    localStorage.numLetters = this.numLetters;
    localStorage.numAttempts = this.numAttempts;
    localStorage.voclist = this.voclist;
  }
};
