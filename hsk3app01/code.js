let currentMode = 'Pinyin';
let questionCount = parseInt(localStorage.getItem('questionCount')) || 20;
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentWord = null;
let answerTimeout;
let countdownInterval;
let isPaused = false;
let isGameEnded = false;

// Gamificación
let score = 0;
let streak = 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
let answeredWords = [];
let questionStartTime = 0;

document.addEventListener('DOMContentLoaded', function() {
  // 🎨 Colores dinámicos
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 80%, 70%)`;
  const c1 = randomColor();
  const c2 = randomColor();
  const c3 = randomColor();
  document.documentElement.style.setProperty('--color1', c1);
  document.documentElement.style.setProperty('--color2', c2);
  document.documentElement.style.setProperty('--color3', c3);

  // 🎮 Configuración inicial
  const defaultModeBtn = document.getElementById('modePinyin');
  if (defaultModeBtn) defaultModeBtn.classList.add('active');
  currentMode = 'Pinyin';
  updateModeLabel();
  document.getElementById('questionCount').textContent = questionCount;
  hideGameElements();

  document.getElementById('pauseGame').disabled = true;
  document.getElementById('endGame').disabled = true;

  // 🌐 Botón More...
  const moreBtn = document.getElementById('moreGames');
  if (moreBtn) {
    moreBtn.onclick = () => {
      window.location.href = 'https://isaacjar.github.io/chineseapps/';
    };
  }

  // 🎛️ Cambio de modo
  const modeButtons = document.querySelectorAll('.mode');
  if (modeButtons.length) {
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.textContent;
        updateModeLabel();
      });
    });
  }

  // ➕➖ Ajuste de número de preguntas
  document.getElementById('increase').onclick = () => {
    questionCount = Math.min(100, questionCount + 1);
    document.getElementById('questionCount').textContent = questionCount;
    localStorage.setItem('questionCount', questionCount);
  };

  document.getElementById('decrease').onclick = () => {
    questionCount = Math.max(1, questionCount - 1);
    document.getElementById('questionCount').textContent = questionCount;
    localStorage.setItem('questionCount', questionCount);
  };

  // ▶️ Nuevo juego
  document.getElementById('newGame').onclick = () => {
    isGameEnded = false;
    isPaused = false;
    showGameElements();
    document.querySelector('.question-settings').style.display = 'none';
    document.querySelector('.mode-toggle').style.display = 'none';
    document.getElementById('summaryMessage').style.display = 'none';
    document.getElementById('vocabReview').style.display = 'none';
    document.getElementById('questionProgress').hidden = false;
    startGame();
    document.getElementById('pauseGame').textContent = '⏸ Pause';
    document.getElementById('pauseGame').disabled = false;
    document.getElementById('endGame').disabled = false;
  };

  // ⏹ Fin del juego
  document.getElementById('endGame').onclick = () => {
    isGameEnded = true;
    clearTimeout(answerTimeout);
    clearInterval(countdownInterval);
    showResults();
    disableButtons();

    document.querySelector('.question-display').style.display = 'none';
    document.querySelector('.options').style.display = 'none';
    document.querySelector('.question-settings').style.display = 'block';
    document.querySelector('.mode-toggle').style.display = 'block';

    document.getElementById('pauseGame').disabled = true;
    document.getElementById('endGame').disabled = true;
    document.getElementById('questionProgress').hidden = true;
  };

  // ⏸ Pausar / Reanudar
  document.getElementById('pauseGame').onclick = () => {
    const pauseBtn = document.getElementById('pauseGame');
    if (!isPaused) {
      isPaused = true;
      clearTimeout(answerTimeout);
      clearInterval(countdownInterval);
      document.getElementById('questionLabel').textContent = '⏸ Game Paused';
      pauseBtn.textContent = '▶ Resume';
    } else {
      isPaused = false;
      pauseBtn.textContent = '⏸ Pause';
      nextQuestion();
    }
  };

  // ✅ Responder pregunta
  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      checkAnswer(btn.textContent);

      // Desactiva interacción y aclara visualmente
      document.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
      });

      // Elimina el foco visual
      setTimeout(() => btn.blur(), 100);
    });
  });

  // 🔧 Redirigir el foco a un elemento visible para evitar el efecto azul
  const focusRedirect = document.getElementById('focusRedirect');
  document.querySelectorAll('button, .option').forEach(btn => {
    btn.addEventListener('touchend', () => {
      btn.blur();
      if (focusRedirect) focusRedirect.focus();
    });
    btn.addEventListener('mouseup', () => {
      btn.blur();
      if (focusRedirect) focusRedirect.focus();
    });
  });

  updateStatus();
});

function updateModeLabel() {
  document.getElementById('questionLabel').textContent = `Mode: ${currentMode}`;
}

function hideGameElements() {
  document.querySelector('.question-display').style.display = 'none';
  document.querySelector('.options').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('summaryMessage').style.display = 'none';
  document.getElementById('questionProgress').hidden = true;
  const review = document.getElementById('vocabReview');
  if (review) { review.style.display = 'none'; review.innerHTML = ''; }
  clearCountdownCircles();
}

function showGameElements() {
  document.querySelector('.question-display').style.display = 'block';
  document.querySelector('.options').style.display = 'grid';
  document.getElementById('results').style.display = 'none';
}

function updateStatus() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  const streakDisplay = document.getElementById('streakDisplay');
  const bestScoreDisplay = document.getElementById('bestScoreDisplay');
  if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
  if (streakDisplay) streakDisplay.textContent = `Streak: ${streak}`;
  if (bestScoreDisplay) bestScoreDisplay.textContent = `Best: ${bestScore}`;
}

function showToast(msg, ms = 1200) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.hidden = true;
  }, ms);
}

function showFeedback(isCorrect) {
  const msg = isCorrect
    ? '✅ Correct! +10'
    : '❌ Incorrect! -2';
  showToast(msg);
}

function performanceMessage(accuracy) {
  if (accuracy >= 90) return 'Great job! 🏅';
  if (accuracy >= 70) return 'Nice work! 💪';
  if (accuracy >= 50) return 'Keep going! 🚀';
  return 'Practice makes progress! 🌱';
}

function startGame() {
  currentQuestion = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  score = 0;
  streak = 0;
  answeredWords = [];

  const review = document.getElementById('vocabReview');
  review.style.display = 'none';
  review.innerHTML = '';

  const summary = document.getElementById('summaryMessage');
  summary.style.display = 'none';
  summary.textContent = '';

  updateStatus();
  nextQuestion();
}

function showResults() {
  document.getElementById('results').hidden = false;
  document.getElementById('results').textContent =
    `✅ Correct: ${correctAnswers} | ❌ Incorrect: ${wrongAnswers}`;

  const totalAnswered = correctAnswers + wrongAnswers;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const msg = performanceMessage(accuracy);

  const summary = document.getElementById('summaryMessage');
  summary.textContent = `You answered ${questionCount} questions: ${correctAnswers} right, ${wrongAnswers} wrong. ${msg}`;
  summary.style.display = 'block';

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }
  updateStatus();

  document.querySelector('.mode-toggle').style.display = 'block';
  document.querySelector('.question-settings').style.display = 'block';
  document.querySelector('.question-display').style.display = 'none';
  document.querySelector('.options').style.display = 'none';

  document.getElementById('pauseGame').disabled = true;
  document.getElementById('endGame').disabled = true;
  document.getElementById('questionProgress').hidden = true;

  const vocabReview = document.getElementById('vocabReview');
  vocabReview.innerHTML = '<strong>Vocabulary Review:</strong><br>';
  answeredWords.forEach(word => {
    const icon = word.correct ? '✅' : '❌';
    const line = document.createElement('div');
    line.className = word.correct ? 'vocab-correct' : 'vocab-wrong';
    line.innerHTML = `${icon} ${word.ch} [${word.pin}]  <i>${word.en}</i>`;
    vocabReview.appendChild(line);
  });
  vocabReview.style.display = 'block';
}

function disableButtons() {
  clearCountdownCircles();
}

function clearCountdownCircles() {
  for (let i = 1; i <= 10; i++) {
    const circle = document.getElementById(`c${i}`);
    if (circle) circle.classList.remove('active');
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function nextQuestion() {
  if (!window.vocabulary || window.vocabulary.length === 0) {
    console.error("Vocabulary not loaded");
    showToast("Error: Vocabulary not loaded. Please refresh.");
    
    // Mostrar mensaje de error en lugar de reintentar infinitamente
    document.getElementById('questionLabel').textContent = "Error: Vocabulary not loaded";
    
    // Deshabilitar botones de juego
    document.getElementById('newGame').disabled = true;
    document.getElementById('pauseGame').disabled = true;
    
    return; // No reintentar
  }
  
  if (isGameEnded || isPaused) return;

  clearTimeout(answerTimeout);
  clearInterval(countdownInterval);
  clearCountdownCircles();
  if (focusRedirect) focusRedirect.focus();

  if (currentQuestion >= questionCount) {
    showResults();
    disableButtons();
    return;
  }

  questionStartTime = Date.now();

  const progressLabel = document.getElementById('questionProgress');
  progressLabel.textContent = `${currentQuestion + 1}/${questionCount}`;
  progressLabel.hidden = false;

  currentWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
  let correctText, questionText;

  switch (currentMode) {
    case 'Chinese':
      questionText = currentWord.ch;
      correctText = currentWord.pin;
      break;
    case 'Pinyin':
      questionText = `${currentWord.ch} [${currentWord.pin}]`;
      correctText = currentWord.en;
      break;
    case 'English':
      questionText = currentWord.en;
      correctText = `${currentWord.ch} [${currentWord.pin}]`;
      break;
    case 'ChineseEnglish': 
      questionText = currentWord.ch;
      correctText = currentWord.en;
      break;
  }

  const label = document.getElementById('questionLabel');
  label.classList.remove('fade');
  void label.offsetWidth;
  label.textContent = questionText;
  label.classList.add('fade');
  label.style.fontSize = currentMode === 'Chinese' ? '48px' : '24px';

  let options = [correctText];
  while (options.length < 4) {
    let rand = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    let distractor;
    switch (currentMode) {
      case 'Chinese': distractor = rand.pin; break;
      case 'Pinyin': distractor = rand.en; break;
      case 'English': distractor = `${rand.ch} [${rand.pin}]`; break;
      case 'ChineseEnglish': distractor = rand.en; break; 
    }
    if (!options.includes(distractor)) options.push(distractor);
  }

  shuffle(options);
  const buttons = document.querySelectorAll('.option');
  buttons.forEach((btn, i) => {
    btn.textContent = options[i];
    btn.className = 'option fade';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  });

  const progress = document.getElementById('progressFill');
  const progressValue = (currentQuestion + 1) / questionCount;
  progress.style.width = `${Math.min(progressValue, 1) * 100}%`;

  let countdown = 0;
  countdownInterval = setInterval(() => {
    if (isGameEnded) {
      clearInterval(countdownInterval);
      return;
    }
    if (countdown < 10) {
      const circle = document.getElementById(`c${countdown + 1}`);
      if (circle) circle.classList.add('active');
      countdown++;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);

  const correctRaw = correctText;
  answerTimeout = setTimeout(() => {
    if (isGameEnded) return;

    buttons.forEach(btn => {
      const btnText = btn.textContent.trim().toLowerCase();
      const correctTxt = correctRaw.trim().toLowerCase();
      if (btnText === correctTxt) {
        btn.classList.add('missed');
      } else {
        btn.classList.add('incorrect');
      }
    });

    wrongAnswers++;
    streak = 0;
    score -= 2;
    updateStatus();

    answeredWords.push({
      correct: false,
      ch: currentWord.ch,
      pin: currentWord.pin,
      en: currentWord.en
    });

    setTimeout(() => {
      currentQuestion++;
      nextQuestion();
    }, 2000);
  }, 10000);
}

function checkAnswer(selectedText) {
  if (!currentWord) {
    console.error("No current word defined");
    return;
  }
  
  clearTimeout(answerTimeout);
  clearInterval(countdownInterval);
  clearCountdownCircles();

  disableOptions(); //corrige dobles pulsaciones

  let correct;
  switch (currentMode) {
    case 'Chinese': correct = currentWord.pin; break;
    case 'Pinyin': correct = currentWord.en; break;
    case 'English': correct = `${currentWord.ch} [${currentWord.pin}]`; break;
    case 'ChineseEnglish': correct = currentWord.en; break;
      
  }

  const normalize = str => str.trim().toLowerCase();
  const selected = normalize(selectedText);
  const correctText = normalize(correct);

  document.querySelectorAll('.option').forEach(btn => {
    const btnText = normalize(btn.textContent);
    if (btnText === correctText && selected === correctText) {
      btn.classList.add('correct');
    } else if (btnText === correctText && selected !== correctText) {
      btn.classList.add('missed');
    } else if (btnText === selected && selected !== correctText) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('incorrect');
    }
  });

  const isCorrect = (selected === correctText);

  if (isCorrect) {
    correctAnswers++;
    streak++;

    const base = 10;
    const elapsed = (Date.now() - questionStartTime) / 1000;
    const quickBonus = elapsed <= 2 ? 3 : 0;
    let streakBonus = 0;
    if (streak > 0 && streak % 3 === 0) {
      streakBonus = 5;
      showToast(`🔥 ${streak} in a row! +${streakBonus}`);
    }
    score += base + quickBonus + streakBonus;

    showFeedback(true);
  } else {
    wrongAnswers++;
    streak = 0;
    score -= 2;
    showFeedback(false);
  }

  answeredWords.push({
    correct: isCorrect,
    ch: currentWord.ch,
    pin: currentWord.pin,
    en: currentWord.en
  });

  updateStatus();

  setTimeout(() => {
    currentQuestion++;
    nextQuestion();
  }, 2000);
}

function disableOptions() {
  document.querySelectorAll('.option').forEach(btn => {
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
  });

}





