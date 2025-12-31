import { Settings } from "./settings.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";

const params = new URLSearchParams(location.search);
Settings.init(params);

const board = document.getElementById("board");
const wordBox = document.getElementById("wordBox");
const timerEl = document.getElementById("timer");

let vocab = ["你好","谢谢","再见","学习","老师","学生"];

function startGame(){
  Game.start(vocab, Settings.data.numwords);
  UI.renderBoard(board, Settings.data.numwords);
  UI.showWords(board, Game.active);

  let t = Settings.data.timemem;
  timerEl.textContent = t;

  const memInterval = setInterval(()=>{
    t--;
    timerEl.textContent=t;
    if(t<=0){
      clearInterval(memInterval);
      UI.showNumbers(board);
      nextQuestion();
    }
  },1000);
}

function nextQuestion(){
  const word = Game.pickTarget();
  wordBox.textContent = word;

  board.onclick = e=>{
    if(!e.target.dataset.index) return;
    if(Game.check(Number(e.target.dataset.index))){
      UI.toast("🎉 ¡Correcto!");
      nextQuestion();
    }else{
      UI.toast("❌ Fallaste");
      startGame();
    }
  };
}

startGame();
