import { Settings } from "./settings.js";
import { Game } from "./game.js";

export const UI = {

  renderBoard(container, count){
    container.innerHTML = "";
    for(let i = 0; i < count; i++){
      const b = document.createElement("button");
      b.className = "card-btn fade-in";
      b.dataset.index = i;
      container.appendChild(b);
    }
  },

  showWords(container, words){
    [...container.children].forEach((b, i) => {
      b.innerHTML = "";
      const w = words[i] || "";
      if(!w) return;
      const lines = w.split("\n");
      const chSpan = document.createElement("span");
      chSpan.className = "ch";
      chSpan.textContent = lines[0];
      b.appendChild(chSpan);
      if(lines[1]){
        const pinSpan = document.createElement("span");
        pinSpan.className = "pin";
        pinSpan.textContent = lines[1];
        b.appendChild(pinSpan);
      }
      b.classList.add("fade-in");
      setTimeout(() => b.classList.remove("fade-in"), 300);
    });
  },

  showNumbers(container){
    [...container.children].forEach((b, i) => {
      b.innerHTML = i + 1;
      b.classList.remove("wrong","correct","disabled","jump");
    });
  },

  markCorrect(button, word, showPinyin = true, vocabRaw = []){
    if(!button) return;
    button.classList.add("correct", "disabled");
    button.innerHTML = `
      <span class="ch">${word}</span>
      ${
        Settings.data.lang === "zh" && showPinyin
          ? `<span class="pin">${vocabRaw.find(w => w.ch === word)?.pin || ""}</span>`
          : ""
      }
    `;
    UI.playSound("correct");
  },

  markWrong(container){
    [...container.children].forEach((b, i) => {
      b.classList.add("wrong");
      b.textContent = i + 1;
    });
    UI.playSound("wrong");
  },

  markSingleWrong(button, word, showPinyin = true, vocabRaw = []){
    if(!button) return;
  
    button.classList.add("wrong", "disabled");
    button.innerHTML = `
      <span class="ch">${word}</span>
      ${
        Settings.data.lang === "zh" && showPinyin
          ? `<span class="pin">${vocabRaw.find(w => w.ch === word)?.pin || ""}</span>`
          : ""
      }
    `;
    UI.playSound("wrong");
  },

  toast(msg){
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  },

  celebrate(buttons){
    buttons.forEach(b => b.classList.add("jump"));
    setTimeout(() => buttons.forEach(b => b.classList.remove("jump")), 300);
    const confettiCount = 30;
    for(let i = 0; i < confettiCount; i++){
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = `hsl(${Math.random()*360},70%,70%)`;
      c.style.animationDuration = 0.6 + Math.random() * 0.4 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1000);
    }
  },

  showVictoryPopup(score, onReplay){
    const modal = document.createElement("div");
    modal.className = "modal";
    const box = document.createElement("div");
    box.className = "modal-content";
    box.innerHTML = `
      <h2>🏆 ¡Victoria!</h2>
      <p>Puntuación: <b>${score}</b></p>
      <button id="btnReplay">Otra partida</button>
    `;
    modal.appendChild(box);
    document.body.appendChild(modal);
    box.querySelector("#btnReplay").onclick = () => {
      modal.remove();
      onReplay?.();
    };
  },

  export function showLosePopup(message, onClose, buttonText = "Otra partida") {
    const popup = document.createElement("div");
    popup.className = "popup-overlay";
  
    popup.innerHTML = `
      <div class="popup">
        <h2>😢 Tiempo agotado</h2>
        <p>${message}</p>
        <button id="popupBtn">${buttonText}</button>
      </div>
    `;
  
    document.body.appendChild(popup);
  
    document.getElementById("popupBtn").onclick = () => {
      popup.remove();
      onClose?.();
    };
  }, 
 
  playSound(type){
    let audio;
    if(type === "correct") audio = new Audio("sounds/correct.mp3");
    else if(type === "wrong") audio = new Audio("sounds/wrong.mp3");
    if(audio) audio.play();
  },

  updateProgress(bar, type, value, total){
    if(!bar) return;
    const pct = Math.max(0, Math.min(100, (value / total) * 100));
    bar.classList.remove("mem-phase","round-phase");
    bar.classList.add(type === "mem" ? "mem-phase" : "round-phase");
    bar.style.transition = "width 0.3s linear";
    bar.style.width = pct + "%";
  },

  resetProgress(bar, callback){
    if(!bar) return;
    bar.style.transition = "width 0.5s linear";
    bar.style.width = "0%";
    setTimeout(() => {
      bar.classList.remove("mem-phase","round-phase");
      callback?.();
    }, 500);
  }
};

/* =========================
   Formateo de palabra
========================= */
export function formatWord(word, vocabRaw = [], showPinyin = Settings.data.showPinyin){
  if(!word) return "";
  if(Settings.data.lang !== "zh") return word;
  const obj = vocabRaw.find(w => w.ch === word);
  if(!obj) return word;
  return showPinyin ? `${obj.ch}\n${obj.pin}` : obj.ch;
}

/* =========================
   POPUP VOCABULARIOS
========================= */
export function showVoclistPopup(lists, onSelect){
  const modal = document.createElement("div");
  modal.className = "modal";
  const box = document.createElement("div");
  box.className = "modal-content";
  box.innerHTML = `<h2>📚 Selecciona vocabulario</h2><div class="voclist-container"></div>`;
  const listContainer = box.querySelector(".voclist-container");
  lists.forEach(l => {
    const btn = document.createElement("button");
    btn.className = "card-btn";
    btn.textContent = l.title;
    btn.onclick = () => {
      modal.remove();
      onSelect(l);
    };
    listContainer.appendChild(btn);
  });
  modal.appendChild(box);
  document.body.appendChild(modal);
}

/* =========================
   POPUP OPCIONES
========================= */
export function showSettingsPopup(onClose){
  const modal = document.createElement("div");
  modal.className = "modal";
  const box = document.createElement("div");
  box.className = "modal-content";
  box.innerHTML = `
    <h2>⚙️ Opciones</h2>
    <label>Idioma de juego</label>
    <select id="optLang">
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
    <div id="pinyin-option">
      <span>拼音 (Pinyin)</span>
      <label class="switch">
        <input type="checkbox" id="togglePinyin">
        <span class="slider"></span>
      </label>
    </div>
    <label>Número de palabras: <span id="nwVal"></span></label>
    <input type="range" id="optNumWords" min="4" max="25">
    <label>Segundos memorización: <span id="tmVal"></span></label>
    <input type="range" id="optTimeMem" min="5" max="60">
    <label><input type="checkbox" id="optOrderRandom"> Orden aleatorio</label>
    <label>Tiempo de juego</label>
    <div class="time-row">
      <input type="number" id="minGame" min="0" max="10"> :
      <input type="number" id="secGame" min="0" max="59">
    </div>
    <hr>
    <h3>📊 Estadísticas</h3>
    <p>Partidas jugadas: <b>${Settings.data.stats.played}</b></p>
    <p>Partidas ganadas: <b>${Settings.data.stats.won}</b></p>
    <div class="actions">
      <button id="btnSave">💾 Guardar</button>
      <button id="btnReset">🔄 Reset</button>
      <button id="btnCancel">❌ Cancelar</button>
    </div>
  `;
  modal.appendChild(box);
  document.body.appendChild(modal);

  const langSelect = box.querySelector("#optLang");
  const pinyinRow = box.querySelector("#pinyin-option");
  const pinyinToggle = box.querySelector("#togglePinyin");

    function updatePinyinVisibility(){
    if(langSelect.value === "zh"){
      pinyinRow.style.display = "flex";
      pinyinToggle.checked = Settings.data.showPinyin ?? true;
    } else {
      pinyinRow.style.display = "none";
    }
  }

  langSelect.value = Settings.data.lang;
  updatePinyinVisibility();
  langSelect.onchange = updatePinyinVisibility;

  const nw = box.querySelector("#optNumWords");
  const tm = box.querySelector("#optTimeMem");

  nw.value = Settings.data.numwords;
  tm.value = Settings.data.timemem;
  box.querySelector("#nwVal").textContent = nw.value;
  box.querySelector("#tmVal").textContent = tm.value;

  const mins = Math.floor(Settings.data.time / 60);
  const secs = Settings.data.time % 60;
  box.querySelector("#minGame").value = mins;
  box.querySelector("#secGame").value = secs;

  nw.oninput = () => box.querySelector("#nwVal").textContent = nw.value;
  tm.oninput = () => box.querySelector("#tmVal").textContent = tm.value;

  box.querySelector("#btnSave").onclick = () => {
    Settings.data.lang = langSelect.value;
    Settings.data.numwords = +nw.value;
    Settings.data.timemem = +tm.value;
    Settings.data.time =
      (+box.querySelector("#minGame").value * 60) +
      (+box.querySelector("#secGame").value);
    Settings.data.showPinyin = pinyinToggle.checked;
    Settings.validate();
    Settings.save();
    modal.remove();
    onClose?.();
  };

  box.querySelector("#btnReset").onclick = () => {
    if(confirm("¿Resetear opciones y estadísticas?")){
      Settings.reset();
      modal.remove();
      onClose?.();
    }
  };

  box.querySelector("#btnCancel").onclick = () => modal.remove();
}

/* =========================
   TECLADO
========================= */
let keyListener = null;

export function enableKeyboardInput(numButtons, callback){
  if(keyListener){
    document.removeEventListener("keydown", keyListener);
  }

  keyListener = e => {
    if(e.key >= "1" && e.key <= String(numButtons)){
      callback(Number(e.key) - 1);
    }
  };

  document.addEventListener("keydown", keyListener);

  return () => {
    document.removeEventListener("keydown", keyListener);
    keyListener = null;
  };
}
