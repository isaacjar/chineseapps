// game-session.js
import { getSettings, getSession, setSession } from '../state.js';
import {
  renderHUD,
  updateHUD,
  updateProgress,
  initGameTimer,
  showSuccessToast,
  showFailToast
} from '../ui.js';
import { t } from '../i18n.js';
import { showGameOver } from './game-helpers.js';

export function startGame(config) {
  const settings = getSettings();
  const session = {
    id: config.id,
    title: config.title,
    range: buildRange(settings.range),
    qcount: settings.qcount,
    qtime: settings.qtime,
    lives: settings.fails,
    score: 0,
    errors: 0,
	streak: 0,
	bestStreak: 0,
    asked: 0,
    onQuestion: config.onQuestion
  };

  setSession(session);

  // Pintar HUD completo y progreso inicial
  renderHUD(session);
  updateProgress(0, session.qcount);

  // Arrancar temporizador visual del juego
  //initGameTimer(session.qtime, () => showGameOver());

  showNextQuestion();
}

function buildRange(rangeSetting) {
  // aquí se genera el rango de números/palabras según la configuración
  // placeholder: sustituye con tu lógica real
  return Array.from({ length: 10 }, (_, i) => i + 1);
}

function showNextQuestion() {
  const session = getSession();

  if (session.asked >= session.qcount || session.lives <= 0) {
    showGameOver();
    return;
  }

  session.asked++;
  setSession(session);

  updateProgress(session.asked, session.qcount);

// Reiniciar temporizador para cada pregunta
	initGameTimer(session.qtime, () => {
	  handleAnswer(false); // 👇 Al acabarse el tiempo, cuenta como respuesta fallida
	});

  // Llamamos al generador de preguntas del juego específico
  session.onQuestion({
    correct: () => handleAnswer(true),
    wrong: () => handleAnswer(false)
  });
}

function handleAnswer(isCorrect) {
  const session = getSession();

  if (isCorrect) {
    session.score += 1;
    session.streak++;
	if (session.streak > (session.bestStreak ?? 0)) {
      session.bestStreak = session.streak;   
    }
    setSession(session);
    updateHUD(session);
    updateProgress(session.asked, session.qcount);
    showSuccessToast(); 
  } else {
    session.streak = 0;   
    session.lives = Math.max(0, session.lives - 1);
	session.errors = (session.errors ?? 0) + 1;
    setSession(session);
    updateHUD(session);
    updateProgress(session.asked, session.qcount);
    showFailToast();
  }

  if (session.asked >= session.qcount || session.lives <= 0) {
    showGameOver();
  } else {
    showNextQuestion();
  }
}
