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
