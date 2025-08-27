import { randInt, shuffle } from './rng.js';

const DIGITS = ['零','一','二','三','四','五','六','七','八','九'];
const UNITS = ['', '十','百','千'];
const BIG = ['', '万','亿']; // support up to 9 digits comfortably

const PY_DIGITS = ['líng','yī','èr','sān','sì','wǔ','liù','qī','bā','jiǔ'];
const PY_UNITS = ['', 'shí','bǎi','qiān'];
const PY_BIG = ['', 'wàn','yì'];

export function rangeToBounds(range){
  switch(range){
    case '1-10': return [1, 10];
    case '11-99': return [11, 99];
    case '100-999': return [100, 999];
    case '1000+': return [1000, 999999999];
    default: return [1, 10];
  }
}

export function randomNumberIn(range){
  const [a,b] = rangeToBounds(range);
  return randInt(a,b);
}

// Convert 0..9999 chunk to Chinese
function chunkToChinese(n){
  if(n === 0) return '';
  let s = '';
  const thousands = Math.floor(n/1000);
  const hundreds = Math.floor((n%1000)/100);
  const tens = Math.floor((n%100)/10);
  const ones = n % 10;

  if(thousands) s += DIGITS[thousands] + UNITS[3];
  if(hundreds){
    s += DIGITS[hundreds] + UNITS[2];
  }else if(thousands && (tens || ones)){
    s += '零';
  }

  if(tens){
    if(tens === 1 && !thousands && !hundreds) s += '十';
    else s += DIGITS[tens] + UNITS[1];
  }else if((hundreds || thousands) && ones){
    s += '零';
  }

  if(ones){
    s += DIGITS[ones];
  }
  return s;
}

function chunkToPinyin(n){
  if(n === 0) return '';
  const thousands = Math.floor(n/1000);
  const hundreds = Math.floor((n%1000)/100);
  const tens = Math.floor((n%100)/10);
  const ones = n % 10;
  let out = [];

  if(thousands) out.push(PY_DIGITS[thousands], PY_UNITS[3]);
  if(hundreds){
    out.push(PY_DIGITS[hundreds], PY_UNITS[2]);
  }else if(thousands && (tens || ones)){
    out.push(PY_DIGITS[0]);
  }

  if(tens){
    if(tens === 1 && !thousands && !hundreds) out.push(PY_UNITS[1]);
    else out.push(PY_DIGITS[tens], PY_UNITS[1]);
  }else if((hundreds || thousands) && ones){
    out.push(PY_DIGITS[0]);
  }

  if(ones){
    out.push(PY_DIGITS[ones]);
  }
  return out.join(' ');
}

export function numberToChinese(n){
  if(n === 0) return DIGITS[0];
  const parts = [];
  let bigIdx = 0;
  while(n > 0){
    const chunk = n % 10000;
    if(chunk){
      const chunkStr = chunkToChinese(chunk);
      parts.unshift(chunkStr + BIG[bigIdx]);
    }else{
      // keep place
      parts.unshift('');
    }
    n = Math.floor(n / 10000);
    bigIdx++;
  }
  // Insert zeros between empty chunks when needed
  let out = '';
  for(let i=0;i<parts.length;i++){
    if(!parts[i]){
      if(out && !out.endsWith('零')) out += '零';
    }else{
      out += parts[i];
    }
  }
  // Cleanup duplicated 零
  out = out.replace(/零+/g, '零').replace(/零$/,'');
  return out;
}

export function numberToPinyin(n){
  if(n === 0) return PY_DIGITS[0];
  const parts = [];
  let bigIdx = 0;
  let m = n;
  while(m > 0){
    const chunk = m % 10000;
    if(chunk){
      const s = chunkToPinyin(chunk);
      parts.unshift(s + (PY_BIG[bigIdx] ? ' ' + PY_BIG[bigIdx] : ''));
    }else{
      parts.unshift('');
    }
    m = Math.floor(m / 10000);
    bigIdx++;
  }
  let out = '';
  for(let i=0;i<parts.length;i++){
    if(!parts[i]){
      if(out && !out.endsWith(' líng')) out += ' líng';
    }else{
      if(out && !out.endsWith(' ') && !parts[i].startsWith(' ')) out += ' ';
      out += parts[i];
    }
  }
  out = out.replace(/ líng+/g, ' líng').trim();
  out = out.replace(/ líng$/,'').trim();
  return out;
}

// Distractors
export function digitDistractors(n, count=3){
  const nums = new Set();
  const mag = Math.pow(10, String(n).length - 1);
  const deltas = [-11,-10,-9,-1,1,9,10,11, mag, -mag];
  shuffle(deltas);
  for(const d of deltas){
    const v = n + d;
    if(v > 0 && v !== n) nums.add(v);
    if(nums.size >= count) break;
  }
  while(nums.size < count){
    const jitter = randInt(1, 99);
    const v = Math.max(1, n + (Math.random() < 0.5 ? -jitter : jitter));
    if(v !== n) nums.add(v);
  }
  return Array.from(nums);
}

export function chineseDistractors(n, count=3){
  const variants = new Set();
  const base = numberToChinese(n);

  // Strategy: tweak one digit up/down; swap tens/hundreds when possible
  const tweaks = digitDistractors(n, 8);
  for(const v of tweaks){
    variants.add(numberToChinese(v));
    if(variants.size >= count) break;
  }
  while(variants.size < count){
    // Character-level perturbation: replace one numeral with neighbor
    let s = base;
    const map = { '一':'二','二':'三','三':'四','四':'五','五':'六','六':'七','七':'八','八':'九','九':'一' };
    const idxs = [];
    for(let i=0;i<s.length;i++){
      if(map[s[i]]) idxs.push(i);
    }
    if(idxs.length){
      const i = idxs[randInt(0, idxs.length-1)];
      s = s.slice(0,i) + map[s[i]] + s.slice(i+1);
    }
    if(s !== base) variants.add(s);
  }
  return Array.from(variants).slice(0, count);
}

export function pinyinDistractors(n, count=3){
  const variants = new Set();
  const base = numberToPinyin(n);
  const tweaks = digitDistractors(n, 8);
  for(const v of tweaks){
    variants.add(numberToPinyin(v));
    if(variants.size >= count) break;
  }
  while(variants.size < count){
    // small tone-like swap: replace one token with neighbor token
    const tokens = base.split(' ');
    const i = randInt(0, tokens.length-1);
    const pool = ['yī','èr','sān','sì','wǔ','liù','qī','bā','jiǔ','shí','bǎi','qiān','wàn','yì','líng'];
    const repl = pool[randInt(0, pool.length-1)];
    tokens[i] = repl;
    variants.add(tokens.join(' '));
  }
  return Array.from(variants).slice(0, count);
}
