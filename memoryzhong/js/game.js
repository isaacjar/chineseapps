export const Game = {
  words: [],
  active: [],
  targetIndex: null,
  state: "idle",

  start(words, num){
    this.words = [...words];
    this.active = [];
    for(let i=0;i<num;i++){
      this.active.push(words[Math.floor(Math.random()*words.length)]);
    }
    this.targetIndex = null;
    this.state = "memorize";
  },

  pickTarget(){
    this.targetIndex = Math.floor(Math.random()*this.active.length);
    return this.active[this.targetIndex];
  },

  check(index){
    return index === this.targetIndex;
  }
};

export function isValidInput(key, max){
  if(!/^[0-9]$/.test(key)) return false;
  const n = Number(key);
  return n >= 1 && n <= max;
}

export function enableKeyboardInput(max, onPress){
  function handler(e){
    e.preventDefault();

    // bloquear letras, símbolos, etc.
    if(!/^[0-9]$/.test(e.key)) return;

    const n = Number(e.key);
    if(n < 1 || n > max) return;

    const index = n - 1;
    const btn = document.querySelector(`.card-btn[data-index="${index}"]`);

    if(btn){
      btn.classList.add("jump");
      setTimeout(()=>btn.classList.remove("jump"),200);
    }

    onPress(index);
  }

  document.addEventListener("keydown", handler);

  return () => document.removeEventListener("keydown", handler);
}
