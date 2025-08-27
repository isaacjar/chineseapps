export function sample(array, k){
  const copy = array.slice();
  const out = [];
  while(k-- && copy.length){
    const i = Math.floor(Math.random()*copy.length);
    out.push(copy.splice(i,1)[0]);
  }
  return out;
}

export function shuffle(array){
  const a = array.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(min, max){
  return Math.floor(Math.random()*(max - min + 1)) + min;
}
