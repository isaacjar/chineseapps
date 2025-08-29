// rng.js

/**
 * Entero aleatorio entre min y max (inclusive)
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Devuelve un elemento aleatorio de un array
 */
export function choice(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[randInt(0, arr.length - 1)];
}

/**
 * Mezcla un array (Fisher–Yates shuffle)
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Devuelve k elementos únicos de un array
 */
export function sample(arr, k) {
  if (!arr || arr.length === 0) return [];
  return shuffle(arr).slice(0, k);
}
