// chinese.js
import { sample } from './rng.js';

// dígitos básicos
const digits = ["零","一","二","三","四","五","六","七","八","九"];
const digitsPinyin = ["líng","yī","èr","sān","sì","wǔ","liù","qī","bā","jiǔ"];

// unidades
const units = [
  { v: 10000000, c: "千万", p: "qiān wàn" },
  { v: 1000000,  c: "百万", p: "bǎi wàn" },
  { v: 10000,    c: "万",   p: "wàn" },
  { v: 1000,     c: "千",   p: "qiān" },
  { v: 100,      c: "百",   p: "bǎi" },
  { v: 10,       c: "十",   p: "shí" }
];

/**
 * Convierte número a caracteres chinos
 */
export function chineseChar(n) {
  if (n === 0) return digits[0];
  let str = "";
  let num = n;
  let zero = false;

  for (let { v, c } of units) {
    if (num >= v) {
      const d = Math.floor(num / v);
      if (d > 0) {
        if (!(v === 10 && d === 1 && str === "")) {
          str += digits[d];
        }
        str += c;
        num %= v;
        zero = true;
      }
    } else if (zero && str !== "" && num > 0) {
      str += digits[0];
      zero = false;
    }
  }
  if (num > 0) str += digits[num];
  return str;
}

/**
 * Convierte número a pinyin
 */
export function chinesePinyin(n) {
  if (n === 0) return digitsPinyin[0];
  let str = "";
  let num = n;
  let zero = false;

  for (let { v, p } of units) {
    if (num >= v) {
      const d = Math.floor(num / v);
      if (d > 0) {
        if (!(v === 10 && d === 1 && str === "")) {
          str += digitsPinyin[d] + " ";
        }
        str += p + " ";
        num %= v;
        zero = true;
      }
    } else if (zero && str !== "" && num > 0) {
      str += digitsPinyin[0] + " ";
      zero = false;
    }
  }
  if (num > 0) str += digitsPinyin[num];
  return str.trim();
}

/**
 * Distractores de caracteres chinos
 */
export function chineseDistractors(n, count = 3) {
  const pool = [];
  for (let i = 1; i <= 20; i++) {
    if (n - i > 0) pool.push(n - i);
    pool.push(n + i);
  }
  return sample(pool, count).map(chineseChar);
}

/**
 * Distractores de pinyin
 */
export function pinyinDistractors(n, count = 3) {
  const pool = [];
  for (let i = 1; i <= 20; i++) {
    if (n - i > 0) pool.push(n - i);
    pool.push(n + i);
  }
  return sample(pool, count).map(chinesePinyin);
}
