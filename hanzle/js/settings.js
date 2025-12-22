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
    this.voclist = p.get("voclist") || null;
    this.stats.played = +localStorage.statsPlayed || 0;
    this.stats.won = +localStorage.statsWon || 0;
  },

  save() {
    localStorage.lang = this.lang;
    localStorage.numLetters = this.numLetters;
    localStorage.numAttempts = this.numAttempts;
    localStorage.statsPlayed = this.stats.played;
    localStorage.statsWon = this.stats.won;
  },

  showPopup() {
    const p = document.getElementById("popupSettings");
    p.classList.remove("hidden");
    p.innerHTML = "";

    // Cerrar al hacer clic fuera
    p.addEventListener("click", e => { if(e.target === p) p.classList.add("hidden"); });

    const box = document.createElement("div");
    box.className = "popup-box settings-box";
    box.innerHTML = `
      <h2>Settings</h2>
      <div class="setting-row">
        <label>Language:</label>
        <select id="settingLang">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
      <div class="setting-row">
        <label>Letters: <span id="labelLetters">${this.numLetters}</span></label>
        <input type="range" min="4" max="7" value="${this.numLetters}" id="settingLetters">
      </div>
      <div class="setting-row">
        <label>Attempts: <span id="labelAttempts">${this.numAttempts}</span></label>
        <input type="range" min="4" max="10" value="${this.numAttempts}" id="settingAttempts">
      </div>
      <hr>
      <p>Words played: <span id="statPlayed">${this.stats.played}</span></p>
      <p>Words won: <span id="statWon">${this.stats.won}</span></p>
      <div class="settings-buttons">
        <button id="saveSettings">${App.langData[Settings.lang].save}</button>
        <button id="resetSettings">${App.langData[Settings.lang].reset}</button>
        <button id="cancelSettings">${App.langData[Settings.lang].cancel}</button>
      </div>
    `;
    p.appendChild(box);

    // Actualizar sliders y etiquetas
    const lettersSlider = document.getElementById("settingLetters");
    const attemptsSlider = document.getElementById("settingAttempts");
    const labelLetters = document.getElementById("labelLetters");
    const labelAttempts = document.getElementById("labelAttempts");

    lettersSlider.value = this.numLetters;
    attemptsSlider.value = this.numAttempts;

    lettersSlider.oninput = e => labelLetters.textContent = e.target.value;
    attemptsSlider.oninput = e => labelAttempts.textContent = e.target.value;

    document.getElementById("settingLang").value = this.lang;

    // Botón Guardar
    document.getElementById("saveSettings").onclick = () => {
      this.lang = document.getElementById("settingLang").value;
      this.numLetters = +lettersSlider.value;
      this.numAttempts = +attemptsSlider.value;
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

  updateStats() {
    const e = document.getElementById("statPlayed"); if(e) e.textContent = this.stats.played;
    const w = document.getElementById("statWon"); if(w) w.textContent = this.stats.won;
  },

  incrementPlayed() { this.stats.played++; this.save(); this.updateStats(); },
  incrementWon() { this.stats.won++; this.save(); this.updateStats(); }
};

// Conectar botón de Settings
document.getElementById("btnSettings")?.addEventListener("click", () => Settings.showPopup());
