// game.js

export const Game = {
  active: [],          // lista de palabras activas en la partida
  targetIndex: 0,      // índice de la palabra que el usuario debe adivinar

  start(vocab, num){
    // Copiar vocab y tomar num palabras (ordenadas)
    this.active = [...vocab].slice(0, num);
    this.targetIndex = 0;
  },

  pickTarget(){
    if(this.targetIndex >= this.active.length) return null;
    return this.active[this.targetIndex];
  },

  check(buttonIndex){
    const targetWord = this.active[this.targetIndex];
    const btn = document.querySelector(`.card-btn[data-index="${buttonIndex}"]`);
    if(!btn) return false;

    const clickedText = btn.textContent;

    // Si el botón contiene la palabra objetivo (vale para pinyin debajo)
    if(clickedText.includes(targetWord)){
      this.targetIndex++;
      return true;
    }

    return false;
  },

  isFinished(){
    return this.targetIndex >= this.active.length;
  }
};

/* =========================
   TECLADO
========================= */
let keyListener = null;

export function enableKeyboardInput(numButtons, callback){
  if(keyListener){
    document.removeEventListener("keydown", keyListener);
  }

  keyListener = (e) => {
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
