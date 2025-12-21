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

  showLists(){ const p=document.getElementById("popupLists"); p.classList.remove("hidden"); const box=document.createElement("div"); voclists.forEach(v=>{ const b=document.createElement("button"); b.textContent=v.title; b.onclick=()=>this.loadVoc(v.filename); box.appendChild(b); }); p.innerHTML=""; p.appendChild(box); },

  async loadVoc(name){ Settings.voclist=name; Settings.save(); const txt=await fetch(`https://isaacjar.github.io/chineseapps/hanzle/data/${name}.json`).then(r=>r.text()); this.vocData=txt.trim().split("\n").map(l=>JSON.parse(l)); document.getElementById("popupLists").classList.add("hidden"); this.newWord(); },

  newWord(){ document.getElementById("btnNew").classList.add("hidden"); this.clearMsg(); this.clearKeyboardState(); document.getElementById("solution").classList.add("hidden"); Game.init(this.vocData); },

  restartApp(){ document.getElementById("btnNew").classList.add("hidden"); document.getElementById("solution").classList.add("hidden"); this.clearMsg(); this.clearKeyboardState(); if(Settings.voclist) this.loadVoc(Settings.voclist); else this.showLists(); },

  buildKeyboard(){ const keys="QWERTYUIOPASDFGHJKLÑZXCVBNM".split(""); const k=document.getElementById("keyboard"); k.innerHTML=""; [...keys,"🔙","✅"].forEach(l=>{ const b=document.createElement("div"); b.className="key"; b.textContent=l; b.dataset.key=l.toLowerCase(); b.onclick=()=>{ if(l==="🔙") Game.backspace(); else if(l==="✅") Game.enter(); else Game.addLetter(l.toLowerCase()); }; k.appendChild(b); }); },

  updateKey(letter,state){ const k=document.querySelector(`.key[data-key="${letter}"]`); if(k) k.classList.add(`key-${state}`); },
  clearKeyboardState(){ document.querySelectorAll(".key").forEach(k=>k.classList.remove("key-correct","key-present","key-absent")); },

  bindKeys(){ window.addEventListener("keydown",e=>{ if(e.key==="Enter") Game.enter(); else if(e.key==="Backspace") Game.backspace(); else if(/^[a-zñ]$/i.test(e.key)) Game.addLetter(e.key.toLowerCase()); }); },

  onGameStart(){ this.clearMsg(); },
  onInvalidWord(){ this.msg("❌ Word not in list"); Game.shakeRow(); },

  onWin(solution){ Settings.incrementPlayed(); Settings.incrementWon(); this.showSolution(solution); this.msg(this.langData[Settings.lang].win); launchFireworks(); document.getElementById("btnNew").classList.remove("hidden"); },
  onLose(solution){ Settings.incrementPlayed(); this.showSolution(solution); this.msg(this.langData[Settings.lang].lose); document.getElementById("btnNew").classList.remove("hidden"); },

  showSolution(w){ if(!w) return; const sol=document.getElementById("solution"); sol.querySelector(".ch").textContent=w.ch; sol.querySelector(".pin").textContent=w.pin; sol.querySelector(".en").textContent=w.en; sol.querySelector(".es").textContent=w.es; sol.classList.remove("hidden"); }
};

App.init();

function launchFireworks() {
  const colors = ["#81c784","#fff176","#ff8a65","#64b5f6","#ba68c8"];
  const duration = 1500;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.width = particle.style.height = "8px";
    particle.style.borderRadius = "50%";
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * window.innerWidth + "px";
    particle.style.top = Math.random() * window.innerHeight / 2 + "px";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = 9999;
    document.body.appendChild(particle);

    // Animación simple: caer y desaparecer
    const dx = (Math.random() - 0.5) * 200;
    const dy = 200 + Math.random() * 200;
    const rotation = Math.random() * 720;

    particle.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`, opacity: 0 }
    ], { duration: duration, easing: "ease-out" });

    setTimeout(() => particle.remove(), duration);
  }
}
