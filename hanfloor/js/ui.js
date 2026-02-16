// ui.js 

const UI = {
  init() {
    // Cache DOM jugadores
    this.player1 = document.getElementById("player1");
    this.player2 = document.getElementById("player2");

    this.name1 = document.getElementById("name1");
    this.name2 = document.getElementById("name2");

    this.time1 = document.getElementById("time1");
    this.time2 = document.getElementById("time2");
    this.timeBtns = document.querySelectorAll(".time-btn");

    this.question1 = document.getElementById("question1");
    this.question2 = document.getElementById("question2");

    this.options1 = document.getElementById("options1");
    this.options2 = document.getElementById("options2");

    // Popup y secciones
    this.menuOverlay = document.getElementById("menuOverlay");
    this.menuBox = document.getElementById("menuBox");
    this.gameTypeBtns = document.querySelectorAll("#gameTypeSection .menu-btn");
    this.vocabSelect = document.getElementById("vocabSelect");
    this.player1Input = document.getElementById("player1Name");
    this.player2Input = document.getElementById("player2Name");
    this.btnStartGame = document.getElementById("btnStartGame");
   
   // Language selection
  this.langBtns = document.querySelectorAll(".lang-btn");
  
  // Leer idioma guardado en Settings o fallback a en
  const lastLang = Settings.data.lang || localStorage.getItem("lastLang") || "en";
  this.setActiveLang(lastLang);
  Settings.data.lang = lastLang;  
  
  // Evento click para cada botón
  this.langBtns.forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
  
      // Actualizar visual
      this.setActiveLang(lang);
  
      // Guardar en Settings y localStorage
      Settings.data.lang = lang;
      Settings.save();
  
      // Guardar también en localStorage para persistencia directa
      localStorage.setItem("lastLang", lang);
  
      // Recargar pregunta actual si hay juego en curso
      if (window.Game) {
        loadQuestion();
      }
    };
  });

  // ---------------------
  // Show Pinyin toggle
  // ---------------------
  this.togglePinyin = document.getElementById("togglePinyin");
  
  if (this.togglePinyin) {
    // Estado inicial desde Settings
    this.togglePinyin.checked = !!Settings.data.pinyin;
  
    // Evento cambio
    this.togglePinyin.onchange = () => {
      Settings.data.pinyin = this.togglePinyin.checked;
      Settings.save();
  
      // Recargar pregunta si hay juego activo
      if (window.Game) {
        loadQuestion();
      }
    };
  }

    // Mostrar popup al pulsar START principal
    const btnStart = document.getElementById("btnStart");
    if (btnStart) {
      btnStart.onclick = () => {
        if (window.Game) {
          stopGame(); // 🔥 cortar partida en curso
        }
        this.menuOverlay.classList.remove("hidden");
      };
    }

    // Restaurar últimas opciones guardadas
    const lastGame = localStorage.getItem("lastGame");
    if (lastGame) {
      this.setActiveGameBtn(Number(lastGame));
    } else {  // 🔹 Primera vez: Game 2 por defecto (hanzi-to-meaning)
      this.setActiveGameBtn(2);
      localStorage.setItem("lastGame", 2);
    }

    const lastVocab = localStorage.getItem("lastVocab");
    if (lastVocab && this.vocabSelect) this.vocabSelect.value = lastVocab;

    const lastP1 = localStorage.getItem("lastPlayer1");
    const lastP2 = localStorage.getItem("lastPlayer2");
    if (lastP1) this.player1Input.value = lastP1;
    if (lastP2) this.player2Input.value = lastP2;

    // BOTON ESTADÍSTICAS
    const btnHistory = document.getElementById("btnHistory");
    if (btnHistory) {
      btnHistory.onclick = () => {
        this.showHistoryPopup();
      };
    }

  },

  /* ======================
     NOMBRES Y TIEMPOS
  ====================== */
  setNames(s) {
    this.name1.textContent = s.jugador1 || "Player 1";
    this.name2.textContent = s.jugador2 || "Player 2";
  },

  setActiveLang(lang) {
    this.langBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    this.selectedLang = lang;
  
    // sincronizar con Settings
    Settings.data.lang = lang;
  },

  resetTimers(t) {
    this.time1.textContent = t;
    this.time2.textContent = t;
  },

  setActiveTimeBtn(time) {
    if (!this.timeBtns) return;
    this.timeBtns.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.time) === Number(time));
    });
  },
  
  decreaseTime(p) {
    const el = p === 1 ? this.time1 : this.time2;
    el.textContent = Math.max(0, Number(el.textContent) - 1);
  },

  getTime(p) {
    return Number(p === 1 ? this.time1.textContent : this.time2.textContent);
  },

  penalize(p, sec) {
    const el = p === 1 ? this.time1 : this.time2;
  
    let current = Number(el.textContent);
    const target = Math.max(0, current - sec);
  
    // Clase visual de penalización
    el.classList.add("penalty");
  
    let steps = 0;
    const anim = setInterval(() => {
      current--;
      el.textContent = Math.max(0, current);
      steps++;
  
      if (current <= target || steps >= sec) {
        clearInterval(anim);
  
        // Asegurar valor final correcto
        el.textContent = target;
  
        // Volver a estado normal
        el.classList.remove("penalty");
      }
    }, 120); // velocidad del “tic tic tic”
  },

  /* ======================
     JUGADOR ACTIVO
  ====================== */
  setActive(p) {
    this.player1.classList.toggle("active", p === 1);
    this.player2.classList.toggle("active", p === 2);
    this.player1.classList.toggle("inactive", p !== 1);
    this.player2.classList.toggle("inactive", p !== 2);
  },

  /* ======================
     PREGUNTAS
  ====================== */
   renderQuestion(p, text, options, cb) {
    const q = p === 1 ? this.question1 : this.question2;
    const container = p === 1 ? this.options1 : this.options2;
  
    q.innerHTML = text; // pregunta
    container.innerHTML = ""; // limpiar opciones previas
  
    options.forEach(o => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
  
      // ⚡ Guardar valor real para comparación
      btn.dataset.value = o;
  
      if (window.Game?.mode === "meaning-to-hanzi") {
        // Game3: mostrar hanzi + opcional pinyin
        const word = window.Game.vocab.find(w => w.hanzi === o);
        btn.innerHTML = word ? renderHanzi(word) : o;
         if (word) {
          btn.dataset.value = word.hanzi;        // 🔹 solo caracteres
          btn.innerHTML = Settings.data.pinyin ? renderHanzi(word) : word.hanzi; // 🔹 muestra pinyin si está activado
        } else {
          btn.dataset.value = o;
          btn.textContent = o;
        }
      } else if (window.Game?.mode === "hanzi-to-pinyin") {
        // Game1: mostrar solo pinyin, texto plano
        btn.textContent = o;
      } else if (window.Game?.mode === "hanzi-to-meaning") {
        // Game2: mostrar significado, texto plano
        btn.textContent = o;
      } else {
        // fallback: mostrar texto plano
        btn.textContent = o;
      }
  
      // ⚡ Al hacer click enviamos el valor real, no el HTML
      btn.onclick = () => cb(btn.dataset.value);
  
      container.appendChild(btn);
    });
  },

  /* ======================
     FULL SCREEN
   ====================== */
   goFullscreen() {
    const el = document.documentElement;
  
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }, 

  /* ======================
     COUNT DOWN
   ====================== */
  showCountdown(onFinish) {
    const overlay = document.createElement("div");
    overlay.className = "countdown-overlay";
  
    const box = document.createElement("div");
    box.className = "countdown-box";
    overlay.appendChild(box);
  
    document.body.appendChild(overlay);
  
    const steps = ["3", "2", "1", "GO!"];
    let i = 0;
  
    const beep = document.getElementById("soundBeep");
    const go = document.getElementById("soundGo");
  
    const showStep = () => {
      // reiniciar animación
      box.classList.remove("countdown-box");
      void box.offsetWidth; // fuerza reflow
      box.classList.add("countdown-box");
  
      box.textContent = steps[i];
  
      if (steps[i] === "GO!") {
        go && (go.currentTime = 0, go.play());
      } else {
        beep && (beep.currentTime = 0, beep.play());
      }
    };
  
    showStep();
  
    const interval = setInterval(() => {
      i++;
  
      if (i >= steps.length) {
        clearInterval(interval);
        overlay.remove();
        if (typeof onFinish === "function") onFinish();
        return;
      }
  
      showStep();
    }, 800);
  },

  /* ======================
     POPUP AVANZADO
  ====================== */
  showMenu() {
    if (!this.menuOverlay) return;
    this.menuOverlay.classList.remove("hidden");
  },

  hideMenu() {
    if (!this.menuOverlay) return;
    this.menuOverlay.classList.add("hidden");
  },

  setActiveGameBtn(gameNumber) {
    this.gameTypeBtns.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.game) === gameNumber);
    });
  },

  /* ======================
     WIN POPUP
  ====================== */
  showWinPopup({ name, points }) {
    
    const victory = document.getElementById("soundVictory");
    if (victory) { victory.currentTime = 0; victory.play(); }

    const overlay = document.createElement("div");
    overlay.className = "win-overlay";
  
    overlay.innerHTML = `
      <div class="win-box">
        <h2>🎉 Victory!</h2>
        <p><strong>${name}</strong></p>
        <p>Points: <strong>${points}</strong></p>
        <button>Accept</button>
      </div>
    `;
  
    overlay.querySelector("button").onclick = () => {
      overlay.remove();
      this.showMenu(); // volver a configuración
    };
  
    document.body.appendChild(overlay);
  }, 

  /* ============= RESALTAR JUGADOR ACTIVO CON CUADRO ================ */ 
  markFail(p, duration = 800) {
    const el = p === 1 ? this.player1 : this.player2;
    el.classList.add("fail");
  
    setTimeout(() => {
      el.classList.remove("fail");
    }, duration);
  }, 

  /* ============= MOSTRAR ESTADÍSTICAS ================ */ 
  showHistoryPopup() {
    const key = "hanfloorHistory";
    let data = JSON.parse(localStorage.getItem(key) || "[]");
  
    // ordenar: puntos ↓, respuestas ↓
    data.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.answers - a.answers;
    });
  
    // top 10
    data = data.slice(0, 10);
  
    const overlay = document.createElement("div");
    overlay.className = "history-overlay";
  
    const items = data.length
      ? data.map(d => `
          <div class="history-item">
            <strong>${d.name}</strong> ${d.points} pts. (ans: ${d.answers})
          </div>
        `).join("")
      : `<p>No games played yet.</p>`;
  
    overlay.innerHTML = `
      <div class="history-box">
        <h2>👥 Best players</h2>
  
        <div class="history-list">
          ${items}
        </div>
  
        <div class="history-actions">
          <button id="btnResetHistory">Reset</button>
          <button id="btnCloseHistory">Close</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(overlay);
  
    overlay.querySelector("#btnCloseHistory").onclick = () => overlay.remove();
  
    overlay.querySelector("#btnResetHistory").onclick = () => {
      localStorage.removeItem(key);
      overlay.remove();
    };
  },  
    
  /* ======================
     SONIDO Y FINAL
  ====================== */
  playOk() {
    const s = document.getElementById("soundOk");
    if (s) s.play();
  },

  playFail() {
    const s = document.getElementById("soundFail");
    if (s) s.play();
  },

  showWinner(p) {
    alert(`🎉 ${p === 1 ? this.name1.textContent : this.name2.textContent} wins!`);
  },

  /* ======================
     GUARDAR OPCIONES
  ====================== */
  saveSettings(gameNumber, vocabKey, player1, player2, lang) {
    localStorage.setItem("lastGame", gameNumber);
    localStorage.setItem("lastVocab", vocabKey);
    localStorage.setItem("lastPlayer1", player1);
    localStorage.setItem("lastPlayer2", player2);
    localStorage.setItem("lastLang", lang || "en");
  }

};
