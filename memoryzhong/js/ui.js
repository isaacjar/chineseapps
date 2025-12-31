import { Game } from "./game.js";

export const UI = {

  renderBoard(container, count){
    container.innerHTML="";
    for(let i=0;i<count;i++){
      const b=document.createElement("button");
      b.className="card-btn";
      b.dataset.index=i;
      container.appendChild(b);
    }
  },

  showWords(container, words){
    [...container.children].forEach((b,i)=>{
      b.textContent=words[i];
    });
  },

  showNumbers(container){
    [...container.children].forEach((b,i)=>{
      b.textContent=i+1;
    });
  },

  toast(msg){
    const t=document.createElement("div");
    t.className="toast";
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2000);
  }
};

export async function showVoclistPopup(lists, onSelect){
  const modal = document.createElement("div");
  modal.className = "modal";

  const box = document.createElement("div");
  box.className = "modal-content";

  box.innerHTML = `<h2>📚 Selecciona vocabulario</h2>`;

  lists.forEach(l=>{
    const btn = document.createElement("button");
    btn.className = "card-btn";
    btn.style.margin = "8px";
    btn.textContent = l.title;
    btn.onclick = ()=>{
      modal.remove();
      onSelect(l);
    };
    box.appendChild(btn);
  });

  modal.appendChild(box);
  document.body.appendChild(modal);
}

import { Settings } from "./settings.js";

export function showSettingsPopup(onClose){
  const modal = document.createElement("div");
  modal.className = "modal";

  const box = document.createElement("div");
  box.className = "modal-content";

  box.innerHTML = `
    <h2>⚙️ Opciones</h2>

    <label>Idioma de la app</label>
    <select id="optLang">
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>

    <label>Número de palabras: <span id="nwVal"></span></label>
    <input type="range" id="optNumWords" min="4" max="25">

    <label>Segundos memorización: <span id="tmVal"></span></label>
    <input type="range" id="optTimeMem" min="5" max="60">

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
      <button id="btnReset">🔄 Resetear</button>
      <button id="btnCancel">❌ Cancelar</button>
    </div>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  /* ====== Inicializar valores ====== */
  box.querySelector("#optLang").value = Settings.data.lang;

  const nw = box.querySelector("#optNumWords");
  const tm = box.querySelector("#optTimeMem");

  nw.value = Settings.data.numwords;
  tm.value = Settings.data.timemem;

  box.querySelector("#nwVal").textContent = nw.value;
  box.querySelector("#tmVal").textContent = tm.value;

  nw.oninput = ()=> box.querySelector("#nwVal").textContent = nw.value;
  tm.oninput = ()=> box.querySelector("#tmVal").textContent = tm.value;

  const mins = Math.floor(Settings.data.time / 60);
  const secs = Settings.data.time % 60;
  box.querySelector("#minGame").value = mins;
  box.querySelector("#secGame").value = secs;

  /* ====== Botones ====== */
  box.querySelector("#btnSave").onclick = ()=>{
    Settings.data.lang = box.querySelector("#optLang").value;
    Settings.data.numwords = +nw.value;
    Settings.data.timemem = +tm.value;
    Settings.data.time =
      (+box.querySelector("#minGame").value * 60) +
      (+box.querySelector("#secGame").value);

    Settings.validate();
    Settings.save();
    modal.remove();
    onClose?.();
  };

  box.querySelector("#btnReset").onclick = ()=>{
    if(confirm("¿Resetear opciones y estadísticas?")){
      Settings.reset();
      modal.remove();
      onClose?.();
    }
  };

  box.querySelector("#btnCancel").onclick = ()=>{
    modal.remove();
  };
}
