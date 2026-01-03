// game.js

export const Game = {
  active: [],            // palabras activas (orden del tablero)
  targetIndex: null,     // índice actual que hay que acertar
  solved: [],            // índices ya acertados (orden de la secuencia)
  sequence: [],          // secuencia de índices a preguntar
  seqPos: 0,             // posición actual en la secuencia

  /* =========================
     INICIO DE PARTIDA
  ========================= */
  start(vocab, num){
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    this.active = shuffled.slice(0, num);
    this.resetProgress();
  },

  /* =========================
     SECUENCIA DE PREGUNTAS
     random => solo afecta al orden
  ========================= */
  buildSequence(random = false){
    this.sequence = this.active.map((_, i) => i);

    if(random){
      for(let i = this.sequence.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [this.sequence[i], this.sequence[j]] =
        [this.sequence[j], this.sequence[i]];
      }
    }

    this.seqPos = 0;
    this.targetIndex = this.sequence[0] ?? null;
  },

  /* =========================
     SIGUIENTE PREGUNTA
  ========================= */
  nextTarget(){
    if(this.seqPos >= this.sequence.length){
      this.targetIndex = null;
      return null;
    }

    this.targetIndex = this.sequence[this.seqPos];
    return this.targetIndex;
  },

  /* =========================
     COMPROBACIÓN
  ========================= */
  check(buttonIndex){
    if(buttonIndex === this.targetIndex){
      this.solved.push(this.targetIndex);
      this.seqPos++;
      this.nextTarget();
      return true;
    }
    return false;
  },

  /* =========================
     ESTADO
  ========================= */
  isFinished(){
    return this.solved.length >= this.active.length;
  },

  /* =========================
     REINICIO TRAS FALLO
     (sin tocar tablero)
  ========================= */
  resetProgress(){
    this.solved = [];
    this.sequence = [];
    this.seqPos = 0;
    this.targetIndex = null;
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
