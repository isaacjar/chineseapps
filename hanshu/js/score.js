import { addScore, addStreak, loseLife, getSession } from './state.js';

export function scoreCorrect(timeLeft, timeTotal){
  const base = 100;
  const speedBonus = Math.round((timeLeft/timeTotal) * 50);
  addStreak();
  const { streak } = getSession();
  const streakBonus = (streak >= 3) ? 20 : 0;
  const points = base + speedBonus + streakBonus;
  addScore(points);
  return points;
}

export function penalize(){
  loseLife();
}
