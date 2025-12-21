const App = {
  langData: {},
  vocData: [],

  async init() {
    Settings.load();
    this.langData = await fetch("lang.json").then(r => r.json());

    document.getElementById("appHome")?.addEventListener("click", () => this.restartApp());
    document.getElementById("btnNew")?.addEventListener("click", () => this.newWord());

    if (Settings.voclist) {
      await this.loadVoc(Settings.voclist);
    } else {
      this.showLists();
    }

    this.buildKeyboard();
    this.bindKeys();
  },

  /* =========================
     MENSAJES
  ========================= */
  msg(html) {
    const m = document.getElementById("messages");
    m.innerHTML = html;
  },

  clearMsg() {
    document.getElementById("messages").innerHTML = "";
  },

  /* =========================
     LISTADOS
  ========================= */
  showLists() {
    const p = document.getElementById("popupLists");
    p.classList.remove("hidden");

    const box = document.createElement("div");
    voclists.forEach(v => {
      const b = document.createElement("button");
      b.textContent = v.title;
      b.onclick = () => this.loadVoc(v.filename);
      box.appendChild(b);
    });

    p.innerHTML = "";
    p.appendChild(box);
  },

  async loadVoc(name) {
    Settings.voclist = name;
    Settings.save();

    const txt = await fetch(
      `https://isaacjar.github.io/chineseapps/hanzle/data/${name}.js`
    ).then(r => r.text());

    this.vocData = txt.trim().split("\n").map(l => JSON.parse(l));
    document.getElementById("popupLists").classList.add("hidden");

    this.newWord();
  },

  /* =========================
     PARTIDA
  ========================= */
  newWord() {
    document.getElementById("btnNew").classList.add("hidden");
    this.clearMsg();
    this.clearKeyboardState();
    Game.init(this.vocData);
  },

  restartApp() {
    document.getElementById("btnNew").classList.add("hidden");
    this.clearMsg();

    if (Settings.voclist) {
      this.loadVoc(Settings.voclist);
    } else {
      this.showLists();
    }
  },

  /* =========================
     TECLADO
  ========================= */
  buildKeyboard() {
    const keys = "QWERTYUIOPASDFGHJKLÑZXCVBNM".split("");
    const k = document.getElementById("keyboard");
    k.innerHTML = "";

    [...keys, "🔙", "✅"].forEach(l => {
      const b = document.createElement("div");
      b.className = "key";
      b.textContent = l;
      b.dataset.key = l.toLowerCase();

      b.onclick = () => {
        if (l === "🔙") Game.backspace();
        else if (l === "✅") Game.enter();
        else Game.addLetter(l.toLowerCase());
      };

      k.appendChild(b);
    });
  },

  updateKey(letter, state) {
    const k = document.querySelector(`.key[data-key="${letter}"]`);
    if (k) k.classList.add(`key-${state}`);
  },

  clearKeyboardState() {
    document.querySelectorAll(".key").forEach(k => {
      k.classList.remove("key-correct", "key-present", "key-absent");
    });
  },

  bindKeys() {
    window.addEventListener("keydown", e => {
      if (e.key === "Enter") Game.enter();
      else if (e.key === "Backspace") Game.backspace();
      else if (/^[a-zñ]$/i.test(e.key)) Game.addLetter(e.key.toLowerCase());
    });
  },

  /* =========================
     CALLBACKS DESDE GAME.JS
  ========================= */
  onGameStart() {
    this.clearMsg();
  },

  onInvalidWord() {
    this.msg("❌ Word not in list");
  },

  onGuessResult(result) {
    result.letters.forEach(l => {
      this.updateKey(l.char, l.state);
    });
  },

  onWin(solution) {
    this.showSolution(solution);
    this.msg(this.langData[Settings.lang].win);
    document.getElementById("btnNew").classList.remove("hidden");
  },

  onLose(solution) {
    this.showSolution(solution);
    this.msg(this.langData[Settings.lang].lose);
    document.getElementById("btnNew").classList.remove("hidden");
  },

  /* =========================
     SOLUCIÓN
  ========================= */
  showSolution(w) {
    if (!w) return;

    this.msg(`
      <div class="solution">
        <div class="ch">${w.ch}</div>
        <div class="pin">${w.pin}</div>
        <div class="tr">${w.en} / ${w.es}</div>
      </div>
    `);
  }
};

App.init();
