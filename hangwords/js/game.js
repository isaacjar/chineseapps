/* game.js — flujo del juego y lógica depurado y compacto */

let currentWord=null, previousWord=null, currentWordDisplay=[], mistakes=0, maxMistakes=5, questionsLeft=0, lettersGuessed=new Set(), stats=loadStats(), usedWords=[];

/* =========================== UTILIDADES ============================ */
function randomFrom(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
function saveStats(){localStorage.setItem("hangmanStats",JSON.stringify(stats));}
function loadStats(){const s=JSON.parse(localStorage.getItem("hangmanStats")||"{}");return {score:s.score||0,correctLetters:s.correctLetters||0,correct:s.correct||0,wrong:s.wrong||0};}
function normalizeChar(c){return c.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
const safeAddEventListener=(i,e,f)=>document.getElementById(i)?.addEventListener(e,f);

/* =========================== DISPLAY ============================ */
function updateDisplay(){ const w = document.getElementById("wordArea"); if (w) w.textContent = currentWordDisplay?.join(" ") || ""; const s = document.getElementById("score");  if (s) s.textContent = stats.score;}
function updateScoreDisplay(){document.getElementById("score")&&(document.getElementById("score").textContent=stats.score);document.getElementById("correctLetters")&&(document.getElementById("correctLetters").textContent=stats.correctLetters);}
function updateLivesDisplay(){document.getElementById("lives")&&(document.getElementById("lives").textContent=maxMistakes-mistakes);}

/* =========================== HANGMAN SVG ============================ */
function updateHangmanSVG(stage){const svg=document.getElementById("hangmanSVG");if(!svg)return;svg.innerHTML="";const addLine=(x1,y1,x2,y2,w)=>{let l=document.createElementNS("http://www.w3.org/2000/svg","line");l.setAttribute("x1",x1);l.setAttribute("y1",y1);l.setAttribute("x2",x2);l.setAttribute("y2",y2);l.setAttribute("stroke","black");l.setAttribute("stroke-width",w);svg.appendChild(l);};if(stage>=1)addLine(10,190,90,190,4);if(stage>=2)addLine(50,190,50,20,4);if(stage>=3)addLine(50,20,120,20,4);if(stage>=4)addLine(120,20,120,50,3);if(stage>=5){let c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",120);c.setAttribute("cy",70);c.setAttribute("r",20);c.setAttribute("stroke","black");c.setAttribute("stroke-width",3);c.setAttribute("fill","none");svg.appendChild(c);}if(stage>=6)addLine(120,90,120,140,3);if(stage>=7)addLine(120,110,90,90,3);if(stage>=8)addLine(120,110,150,90,3);if(stage>=9)addLine(120,140,90,170,3);if(stage>=10)addLine(120,140,150,170,3);}

/* =========================== TECLADO ============================ */
function initKeyboard(){const k=document.getElementById("keyboard");if(!k)return;k.innerHTML=""; "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{let b=document.createElement("button");b.className="key";b.textContent=l;b.addEventListener("click",()=>guessLetter(l));k.appendChild(b);});}
function resetKeyboard(){document.querySelectorAll(".key").forEach(k=>{k.classList.remove("correct","wrong");k.disabled=false;});}

/* =========================== GUESS LETTER ============================ */
function guessLetter(letter){
    if(!currentWord||lettersGuessed.has(letter))return;lettersGuessed.add(letter);let correct=false;
    currentWord.split("").forEach((c,i)=>{if(normalizeChar(c)===normalizeChar(letter)){currentWordDisplay[i]=c;correct=true;}});
    updateDisplay();const keyBtn=Array.from(document.querySelectorAll(".key")).find(k=>normalizeChar(k.textContent)===normalizeChar(letter));
    if(correct){if(keyBtn){keyBtn.classList.add("correct");keyBtn.disabled=true;}stats.correctLetters++;toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.successMessages||["¡Bien!"]));if(!currentWordDisplay.includes("_")){stats.score+=stats.correctLetters;stats.correct++;saveStats();setTimeout(nextWord,3000);}}
    else{mistakes++;updateHangmanSVG(mistakes);if(keyBtn){keyBtn.classList.add("wrong");keyBtn.disabled=true;}toast(randomFrom(langStrings?.[window.settingsLocal?.lang]?.failMessages||["Fallaste"]));if(mistakes>=maxMistakes){stats.wrong++;saveStats();showCorrectWord();}}
    updateScoreDisplay();updateLivesDisplay();
}

/* =========================== JUEGO ============================ */
function startGame(customList){
    if(customList&&Array.isArray(customList)&&customList.length>0){window.customWordList=customList;window.useCustomWords=true;}
    if(!window.useCustomWords&&(!window.currentVoc||Object.keys(window.currentVoc).length===0)){toast("No vocabulary loaded!");return;}
    mistakes=0;lettersGuessed.clear();maxMistakes=window.settingsLocal?.lives||5;questionsLeft=window.settingsLocal?.questions||10;
    resetKeyboard();updateHangmanSVG(0);usedWords=[];nextWord();
}

function nextWord(){
    mistakes=0; stats.correctLetters=0; lettersGuessed.clear(); updateLivesDisplay(); updateHangmanSVG(0);
    if(questionsLeft<=0){endGame(); return;}
    let vocArray=(window.useCustomWords&&Array.isArray(window.customWordList))?window.customWordList.map(w=>({pin:w})):Object.values(window.currentVoc),
        longWords=vocArray.filter(v=>v.pin&&v.pin.replace(/\s/g,'').length>=5),
        available=longWords.filter(w=>!usedWords.includes(w.pin));
    if(!available.length){usedWords=[]; available=longWords;}
    const next=available[Math.floor(Math.random()*available.length)];
    currentWord=next.pin; previousWord=currentWord; usedWords.push(currentWord);
    console.log("Playing word:",currentWord);
    currentWordDisplay=Array.from(currentWord).map(c=>c===" "?" ":"_");
    resetKeyboard(); updateDisplay(); updateScoreDisplay(); questionsLeft--;
}

/* =========================== MODALES ============================ */
const modal=document.getElementById("customWordsModal"), wordListModal=document.getElementById("wordListModal"), overlay=document.createElement("div");
overlay.id="modalOverlay";overlay.style.cssText="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999";document.body.appendChild(overlay);

function openModal(m){m.classList.remove("hidden");overlay.style.display="block";document.body.classList.add("modal-open");document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=true);}
function closeModal(m){m.classList.add("hidden");overlay.style.display="none";document.body.classList.remove("modal-open");document.querySelectorAll(".key, #btnNew, #btnAdd").forEach(el=>el.disabled=false);}

/* -- + Palabras personalizadas -- */
safeAddEventListener("btnAdd","click",()=>openModal(modal));
safeAddEventListener("modalCancel","click",()=>closeModal(modal));
safeAddEventListener("modalOK","click",()=>{
    const raw=document.getElementById("customWordsInput")?.value.trim();
    if(!raw){toast("No words entered");return;}
    const list=raw.split(/[\s,.;]+/).map(w=>w.trim().toLowerCase()).filter(w=>w.length>=5);
    if(list.length===0){toast("Invalid list");return;}
    closeModal(modal);toast("Custom list loaded: "+list.length+" words");startGame(list);
});

/* -- Ver palabras cargadas -- */
const wordListContainer=document.getElementById("wordListContainer");
safeAddEventListener("btnListWords","click",()=>{
    wordListContainer.innerHTML="";let words=[];
    if(window.useCustomWords&&Array.isArray(window.customWordList))words=window.customWordList.filter(w=>w.replace(/\s/g,'').length>=5);
    else if(window.currentVoc)words=Object.values(window.currentVoc).map(v=>v.pin).filter(w=>w.replace(/\s/g,'').length>=5);
    if(words.length===0)wordListContainer.innerHTML="<li>No words loaded</li>";
    else words.forEach(w=>{const li=document.createElement("li");li.textContent=w;wordListContainer.appendChild(li);});
    wordListModal.style.display="block";overlay.style.display="block";document.body.classList.add("modal-open");
});
safeAddEventListener("wordListClose","click",()=>{wordListModal.style.display="none";overlay.style.display="none";document.body.classList.remove("modal-open");});

/* =========================== OTROS ============================ */
function showCorrectWord(){toast("❗ La palabra era: "+currentWord);document.querySelectorAll(".key").forEach(k=>k.disabled=true);setTimeout(nextWord,3000);}
function endGame(){toast("🏁 ¡Juego terminado!");}
function loadCurrentVoc(vocObj){window.currentVoc=vocObj||{};}
function initGameBindings(){safeAddEventListener("btnNew","click",()=>startGame());}

/* =========================== INIT ============================ */
window.addEventListener("DOMContentLoaded",()=>{initKeyboard();initGameBindings();});
