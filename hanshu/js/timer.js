export function createTimer(seconds, onTick, onEnd){
  let left = seconds;
  let id = null;
  const startTime = Date.now();

  function tick(){
    const elapsed = Math.floor((Date.now() - startTime)/1000);
    left = Math.max(0, seconds - elapsed);
    onTick(left, seconds);
    if(left <= 0){
      clearInterval(id);
      onEnd?.();
    }
  }
  id = setInterval(tick, 200);
  tick();

  return {
    stop(){ clearInterval(id); },
    timeLeft(){ return left; }
  };
}

export function renderTimer(container){
  container.innerHTML = `<div class="timer"><div class="bar" style="width:100%"></div></div>`;
  const bar = container.querySelector('.bar');
  return (left, total) => {
    const pct = Math.max(0, Math.min(100, (left/total)*100));
    bar.style.width = pct + '%';
    if(pct < 30) bar.style.background = 'linear-gradient(90deg,#ff6b6b,#ffafcc)';
    else if(pct < 60) bar.style.background = 'linear-gradient(90deg,#ffd166,#ffa69e)';
    else bar.style.background = 'linear-gradient(90deg,#8ecae6,#a3d5ff)';
  };
}
