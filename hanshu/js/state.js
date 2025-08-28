const DEFAULTS = {
  language: 'en',
  pinyinHints: true,
  range: '1-10',           // '1-10' | '11-99' | '100-999' | '1000+'
  questionCount: 10,       // 3..25
  timePerQuestion: 10,     // 1..20
  allowedFails: 3          // 0..questionCount
};

let settings = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('settings') || '{}') };

let session = {
  score: 0,
  streak: 0,
  correct: 0,
  wrong: 0,                 // 👈 nuevo: contador de fallos
  lives: settings.allowedFails,
  current: 0,
  total: settings.questionCount
};

export function initState(){
  settings.allowedFails = Math.min(settings.allowedFails, settings.questionCount);
  persistSettings();
  resetSession();
}

export function getSettings(){ 
  return { ...settings }; 
}

export function updateSettings(patch){
  settings = { ...settings, ...patch };
  if ('questionCount' in patch) {
    settings.allowedFails = Math.min(settings.allowedFails, settings.questionCount);
  }
  persistSettings();
  window.dispatchEvent(new CustomEvent('settings-changed', { detail: { settings }}));
}

function persistSettings(){
  localStorage.setItem('settings', JSON.stringify(settings));
}

export function resetSession(){
  session = {
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,               // 👈 reinicia fallos
    lives: settings.allowedFails,
    current: 0,
    total: settings.questionCount
  };
}

export function getSession(){ 
  return { ...session }; 
}

export function setSession(patch){ 
  session = { ...session, ...patch }; 
}

export function loseLife(){
  session.lives = Math.max(0, session.lives - 1);
  session.streak = 0;
  session.wrong += 1;       // 👈 cuenta fallo
}

export function addScore(points){
  session.score += points;
}

export function addStreak(){
  session.streak += 1;
}

export function addCorrect(){
  session.correct += 1;
}

export function addWrong(){
  session.wrong += 1;
}

export function incQuestion(){
  session.current += 1;
}
