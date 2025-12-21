const App = {
  langData: {},
  vocData: [],

  async init() {
    Settings.load();
    this.langData = await fetch("lang.json").then(r=>r.json());
    if (Settings.voclist) this.loadVoc(Settings.voclist);
    else this.showLists();
    this.buildKeyboard();
    this.bindKeys();
  },

  msg(t) {
    document.getElementById("messages").textContent = t;
  },

  showLists() {
    const p = document.getElementById("popupLists");
    p.classList.remove("hidden");
    const box = document.createElement("div");
    voclists.forEach(v=>{
      const b = document.createElement("button");
      b.textContent = v.title;
      b.onclick = ()=>this.loadVoc(v.filename);
      box.appendChild(b);
    });
    p.innerHTML = "";
    p.appendChild(box);
  },

  async loadVoc(name) {
    Settings.voclist = name;
    Settings.save();
    const txt = await fetch(`https://isaacjar.github.io/chineseapps/hanzle/data/${name}.js`).then(r=>r.text());
    this.vocData = txt.trim().split("\n").map(l=>JSON.parse(l));
    document.getElementById("popupLists").classList.add("hidden");
    Game.init(this.vocData);
    this.msg(this.langData[Settings.lang].enter);
  },

  buildKeyboard() {
    const keys = "QWERTYUIOPASDFGHJKLÑZXCVBNM".split("");
    const k = document.getElementById("keyboard");
    [...keys,"🔙","✅"].forEach(l=>{
      const b = document.createElement("div");
      b.className = "key";
      b.textContent = l;
      b.onclick = ()=>{
        if (l==="🔙") Game.backspace();
        else if (l==="✅") Game.enter();
        else Game.addLetter(l.toLowerCase());
      };
      k.appendChild(b);
    });
  },

  bindKeys() {
    window.addEventListener("keydown", e=>{
      if (e.key==="Enter") Game.enter();
      else if (e.key==="Backspace") Game.backspace();
      else if (/^[a-zñ]$/i.test(e.key)) Game.addLetter(e.key.toLowerCase());
    });
  },

  win() {
    this.msg(this.langData[Settings.lang].win);
    document.getElementById("btnNew").classList.remove("hidden");
  },

  lose() {
    this.msg(`${this.langData[Settings.lang].lose}: ${Game.solution}`);
    document.getElementById("btnNew").classList.remove("hidden");
  }
};

App.init();
