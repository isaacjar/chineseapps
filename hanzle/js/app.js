const App = {
  langData:{}, vocData:[],

  async init() {
    Settings.load();
    this.langData = await fetch("js/lang.json").then(r=>r.json());
    document.getElementById("appHome")?.addEventListener("click",()=>this.restartApp());
    document.getElementById("btnNew")?.addEventListener("click",()=>this.newWord());
    if(Settings.voclist) await this.loadVoc(Settings.voclist); else this.showLists();
    this.buildKeyboard();
    this.bindKeys();
  },

  msg(html){ document.getElementById("messages").innerHTML=html; },
  clearMsg(){ document.getElementById("messages").innerHTML=""; },

 showLists() {
    const p = document.getElementById("popupLists");
    p.classList.remove("hidden");
  
    // Limpiar contenido previo
    p.innerHTML = "";
  
    // Caja interna del popup
    const box = document.createElement("div");
    box.className = "popup-box";
  
    // Cabecera
    const header = document.createElement("h2");
    header.textContent = this.langData[Settings.lang]?.chooseList || "Choose List";
    box.appendChild(header);
  
    // Contenedor de botones con scroll
    const container = document.createElement("div");
    container.className = "list-container";
  
    voclists.forEach(v => {
      const btn = document.createElement("button");
      btn.textContent = v.title;
  
      // Al pulsar, carga vocabulario y oculta popup
      btn.onclick = () => {
        this.loadVoc(v.filename);
        p.classList.add("hidden");
      };
  
      // Efecto ripple
      btn.addEventListener("click", e => {
        const circle = document.createElement("span");
        circle.className = "ripple";
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        circle.style.width = circle.style.height = size + "px";
        circle.style.left = (e.clientX - rect.left - size / 2) + "px";
        circle.style.top = (e.clientY - rect.top - size / 2) + "px";
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      });
  
      container.appendChild(btn);
    });
  
    box.appendChild(container);
  
    // Botón de cierre en la esquina superior derecha
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.onclick = () => p.classList.add("hidden");
    box.appendChild(closeBtn);
  
    p.appendChild(box);
  },

   async loadVoc(name) {
    try {
      Settings.voclist = name;
      Settings.save();
  
      const response = await fetch(`https://isaacjar.github.io/chineseapps/hanzle/data/${name}.json`);
      if (!response.ok) throw new Error(`No se pudo cargar el archivo: ${response.status}`);
  
      // Parsear directamente el array completo
      this.vocData = await response.json();
  
      if (!Array.isArray(this.vocData) || this.vocData.length === 0) {
        this.msg("⚠️ La lista está vacía o no es un array válido.");
        return;
      }
  
      document.getElementById("popupLists").classList.add("hidden");
      this.newWord();
  
    } catch (err) {
      console.error("Error cargando vocabulario:", err);
      this.msg("❌ No se pudo cargar la lista. Revisa tu conexión o el archivo.");
    }
  },

  newWord() {
    document.getElementById("btnNew").classList.add("hidden");
    this.clearMsg();
    this.clearKeyboardState();
    document.getElementById("solution").classList.add("hidden");
    Game.init(this.vocData);
  },

  restartApp() {
    document.getElementById("btnNew").classList.add("hidden");
    document.getElementById("solution").classList.add("hidden");
    this.clearMsg();
    this.clearKeyboardState();
    if(Settings.voclist) this.loadVoc(Settings.voclist); else this.showLists();
  },

  buildKeyboard() {
    const keys="QWERTYUIOPASDFGHJKLÑZXCVBNM".split("");
    const k=document.getElementById("keyboard");
    k.innerHTML="";
    [...keys,"🔙","✅"].forEach(l=>{
      const b=document.createElement("div");
      b.className="key";
      b.textContent=l;
      b.dataset.key=l.toLowerCase();
      b.onclick=()=>l==="🔙"?Game.backspace():l==="✅"?Game.enter():Game.addLetter(l.toLowerCase());
      k.appendChild(b);
    });
  },

  updateKey(letter,state){ document.querySelector(`.key[data-key="${letter}"]`)?.classList.add(`key-${state}`); },
  clearKeyboardState(){ document.querySelectorAll(".key").forEach(k=>k.classList.remove("key-correct","key-present","key-absent")); },

  bindKeys(){ window.addEventListener("keydown",e=>{ /^[a-zñ]$/i.test(e.key)?Game.addLetter(e.key.toLowerCase()):e.key==="Enter"?Game.enter():e.key==="Backspace"&&Game.backspace(); }); },

  onGameStart(){ this.clearMsg(); },
  onInvalidWord(){ this.msg("❌ Word not in list"); Game.shakeRow(); },

  onWin(solution) {
    Settings.incrementPlayed();
    Settings.incrementWon();
    this.showSolution(solution);
    this.msg(this.langData[Settings.lang].win);
    launchFireworks();
    document.getElementById("btnNew").classList.remove("hidden");
  },

  onLose(solution) {
    Settings.incrementPlayed();
    this.showSolution(solution);
    this.msg(this.langData[Settings.lang].lose);
    document.getElementById("btnNew").classList.remove("hidden");
  },

  showSolution(w) {
    if(!w) return;
    const sol=document.getElementById("solution");
    sol.querySelector(".ch").textContent=w.ch;
    sol.querySelector(".pin").textContent=w.pin;
    sol.querySelector(".en").textContent=w.en;
    sol.querySelector(".es").textContent=w.es;
    sol.classList.remove("hidden");
  }
};

App.init();

function launchFireworks() {
  const colors=["#81c784","#fff176","#ff8a65","#64b5f6","#ba68c8"], duration=1500;
  for(let i=0;i<30;i++){
    const p=document.createElement("div");
    p.style.position="fixed";
    p.style.width=p.style.height="8px";
    p.style.borderRadius="50%";
    p.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
    p.style.left=Math.random()*window.innerWidth+"px";
    p.style.top=Math.random()*window.innerHeight/2+"px";
    p.style.pointerEvents="none";
    p.style.zIndex=9999;
    document.body.appendChild(p);
    const dx=(Math.random()-0.5)*200, dy=200+Math.random()*200, rot=Math.random()*720;
    p.animate([{transform:`translate(0,0) rotate(0deg)`,opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:0}],{duration:duration,easing:"ease-out"});
    setTimeout(()=>p.remove(),duration);
  }
}
