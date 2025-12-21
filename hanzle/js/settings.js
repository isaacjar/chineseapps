const Settings = {
  lang: "en",
  numLetters: 5,
  numAttempts: 6,
  voclist: null,
  stats: { played: 0, won: 0 },

  load() {
    const p = new URLSearchParams(location.search);
    this.lang = p.get("lang") || localStorage.lang || "en";
    this.numLetters = +p.get("numlet") || +localStorage.numLetters || 5;
    this.numAttempts = +p.get("numint") || +localStorage.numAttempts || 6;
    this.voclist = p.get("voclist") || localStorage.voclist || null;
    this.stats.played = +localStorage.statsPlayed || 0;
    this.stats.won = +localStorage.statsWon || 0;
  },

  save() {
    localStorage.lang = this.lang;
    localStorage.numLetters = this.numLetters;
    localStorage.numAttempts = this.numAttempts;
    localStorage.voclist = this.voclist;
    localStorage.statsPlayed = this.stats.played;
    localStorage.statsWon = this.stats.won;
  },

  showPopup() {
    const p = document.getElementById("popupSettings");
    p.classList.remove("hidden");
    p.innerHTML = "";

    const box = document.createElement("div");
    box.innerHTML = `
      <h2>Settings</h2>
      <label>Language:
        <select id="settingLang">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
      <label>Letters: <span id="labelLetters">${this.numLetters}</span>
        <input type="range" min="4" max="7" value="${this.numLetters}" id="settingLetters">
      </label>
      <label>Attempts: <span id="labelAttempts">${this.numAttempts}</span>
        <input type="range" min="4" max="10" value="${this.numAttempts}" id="settingAttempts">
      </label>
      <hr>
      <p>Words played: <span id="statPlayed">${this.stats.played}</span></p>
      <p>Words won: <span id="statWon">${this.stats.won}</span></p>
      <div style="display:flex;gap:10px; margin-top:10px;">
        <button id="saveSettings">💾 Save</button>
        <button id="resetSettings">🔄 Reset</button>
        <button id="cancelSettings">Cancel</button>
      </div>
    `;
    p.appendChild(box);

    document.getElementById("settingLang").value = this.lang;
    document.getElementById("settingLetters").value = this.numLetters;
    document.getElementById("settingAttempts").value = this.numAttempts;

    // Actualizar etiquetas mientras se mueve el slider
    document.getElementById("settingLetters").oninput = e => { document.getElementById("labelLetters").textContent = e.target.value; };
    document.getElementById("settingAttempts").oninput = e => { document.getElementById("labelAttempts").textContent = e.target.value; };

    // Botón Guardar
    document.getElementById("saveSettings").onclick = () => {
      this.lang = document.getElementById("settingLang").value;
      this.numLetters = +document.getElementById("settingLetters").value;
      this.numAttempts = +document.getElementById("settingAttempts").value;
      this.save();
      p.classList.add("hidden");
      App.restartApp();
    };

    // Botón Reset
    document.getElementById("resetSettings").onclick = () => {
      this.lang = "en";
      this.numLetters = 5;
      this.numAttempts = 6;
      this.voclist = null;
      this.stats = { played: 0, won: 0 };
      this.save();
      p.classList.add("hidden");
      App.restartApp();
    };

    // Botón Cancelar
    document.getElementById("cancelSettings").onclick = () => { p.classList.add("hidden"); };
  },

  updateStats(){let e=document.getElementById("statPlayed");if(e)e.textContent=this.stats.played;let w=document.getElementById("statWon");if(w)w.textContent=this.stats.won;},
  incrementPlayed(){this.stats.played++;this.save();this.updateStats();},
  incrementWon(){this.stats.won++;this.save();this.updateStats();}
};

// Conectar botón de Settings
document.getElementById("btnSettings")?.addEventListener("click", () => Settings.showPopup());
