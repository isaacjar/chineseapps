// game.js

export const Game = {
  active: [],          // lista de palabras activas en la partida
  targetIndex: null,   // índice actual a adivinar

  start(vocab, num){
    // Copiar vocab y tomar num palabras
    this.active = [...vocab].slice(0, num);
    this.targetIndex = null; // se asignará al iniciar la ronda
  },

  pickRandomTarget(exclude = []){
    // Devuelve un índice aleatorio de las palabras no acertadas
    const available = this.active.map((_, i) => i).filter(i => !exclude.includes(i));
    if(available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  },

  check(buttonIndex){
    // Comprobación estricta por índice
    if(buttonIndex === this.targetIndex){
      this.targetIndex = null; // reseteamos target tras acierto
      return true;
    }
    return false;
  },

  isFinished(correctIndices = []){
    // Termina si todas las palabras han sido acertadas
    return correctIndices.length >= this.active.length;
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
