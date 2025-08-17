let currentMode = 'Pinyin';
let questionCount = parseInt(localStorage.getItem('questionCount')) || 20;
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentWord = null;
let answerTimeout;
let countdownInterval;
let isPaused = false;

document.addEventListener('DOMContentLoaded', () => {
  const defaultModeBtn = document.getElementById('modePinyin');
  defaultModeBtn.classList.add('active');
  currentMode = 'Pinyin';
  updateModeLabel();
  document.getElementById('questionCount').textContent = questionCount;
  hideGameElements();

  document.getElementById('pauseGame').disabled = true;
  document.getElementById('endGame').disabled = true;

  document.querySelectorAll('.mode').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.textContent;
      updateModeLabel();
    });
  });

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

  document.getElementById('newGame').onclick = () => {
    isPaused = false;
    showGameElements();
    document.querySelector('.question-settings').style.display = 'none';
    startGame();
    document.getElementById('pauseGame').textContent = '⏸ Pause';
    document.getElementById('pauseGame').disabled = false;
    document.getElementById('endGame').disabled = false;
  };

  document.getElementById('endGame').onclick = () => {
    clearTimeout(answerTimeout);
    clearInterval(countdownInterval);
    showResults();
    disableButtons();
    document.querySelector('.question-settings').style.display = 'block';
    document.getElementById('pauseGame').disabled = true;
    document.getElementById('endGame').disabled = true;
  };

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

  document.querySelectorAll('.option').forEach(btn => {
    btn.onclick = () => checkAnswer(btn.textContent);
  });
});

function updateModeLabel() {
  document.getElementById('questionLabel').textContent = `Mode: ${currentMode}`;
}

function hideGameElements() {
  document.querySelector('.question-display').style.display = 'none';
  document.querySelector('.options').style.display = 'none';
  document.querySelector('.feedback').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('progressFill').style.width = '0%';
  clearCountdownCircles();
}

function showGameElements() {
  document.querySelector('.question-display').style.display = 'block';
  document.querySelector('.options').style.display = 'grid';
  document.querySelector('.feedback').style.display = 'block';
  document.getElementById('results').style.display = 'none';
}

function startGame() {
  currentQuestion = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  nextQuestion();
}

function showFeedback(isCorrect) {
  document.getElementById('correctImg').hidden = !isCorrect;
  document.getElementById('wrongImg').hidden = isCorrect;
}

function showResults() {
  document.getElementById('results').hidden = false;
  document.getElementById('results').textContent =
    `✅ Correct: ${correctAnswers} | ❌ Incorrect: ${wrongAnswers}`;
  document.getElementById('pauseGame').disabled = true;
  document.getElementById('endGame').disabled = true;
}

function disableButtons() {
  document.querySelectorAll('.option').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('inactive');
  });
  clearCountdownCircles();
}

function clearCountdownCircles() {
  for (let i = 1; i <= 5; i++) {
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
  clearTimeout(answerTimeout);
  clearInterval(countdownInterval);
  clearCountdownCircles();

  if (isPaused) return;

  if (currentQuestion >= questionCount) {
    showResults();
    disableButtons();
    document.querySelector('.question-settings').style.display = 'block';
    return;
  }

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
  }

  const label = document.getElementById('questionLabel');
  label.classList.remove('fade');
  void label.offsetWidth;
  label.textContent = questionText;
  label.classList.add('fade');

  let options = [correctText];
  while (options.length < 4) {
    let rand = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    let distractor;
    switch (currentMode) {
      case 'Chinese': distractor = rand.pin; break;
      case 'Pinyin': distractor = rand.en; break;
      case 'English': distractor = `${rand.ch} [${rand.pin}]`; break;
    }
    if (!options.includes(distractor)) options.push(distractor);
  }

  shuffle(options);
  const buttons = document.querySelectorAll('.option');
  buttons.forEach((btn, i) => {
    btn.textContent = options[i];
    btn.className = 'option fade';
    btn.disabled = false;
  });

  // Progress bar
  const progress = document.getElementById('progressFill');
  const progressValue = (currentQuestion + 1) / questionCount;
  progress.style.width = `${Math.min(progressValue, 1) * 100}%`;

  // Countdown visual with circles
  let countdown = 0;
  countdownInterval = setInterval(() => {
    if (countdown < 5) {
      const circle = document.getElementById(`c${countdown + 1}`);
      if (circle) circle.classList.add('active');
      countdown++;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Timeout for auto-reveal
  answerTimeout = setTimeout(() => {
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correctText) {
        btn.classList.add('missed');
      } else {
        btn.classList.add('incorrect');
      }
    });

    setTimeout(() => {
      currentQuestion++;
      nextQuestion();
    }, 2000);
  }, 5000);
}

function checkAnswer(selectedText) {
  clearTimeout(answerTimeout);
  clearInterval(countdownInterval);
  clearCountdownCircles();

  let correct;
  switch (currentMode) {
    case 'Chinese': correct = currentWord.pin; break;
    case 'Pinyin': correct = currentWord.en; break;
    case 'English': correct = `${currentWord.ch} [${currentWord.pin}]`; break;
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

  if (selected === correctText) {
    correctAnswers++;
    showFeedback(true);
  } else {
    wrongAnswers++;
    showFeedback(false);
  }

  setTimeout(() => {
    currentQuestion++;
    nextQuestion();
  }, 2000);
}
