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
