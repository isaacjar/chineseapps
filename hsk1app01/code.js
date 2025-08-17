let currentMode = 'Pinyin';
let questionCount = parseInt(localStorage.getItem('questionCount')) || 20;
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentWord = null;
let answerTimeout;
let countdownInterval;
let isPaused = false;
let answeredWords = [];

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
    document.querySelector('.mode-toggle').style.display = 'none';
    document.getElementById('summaryMessage').style.display = 'none';
    document.getElementById('questionProgress').hidden = false;
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

    document.querySelector('.question-display').style.display = 'none';
    document.querySelector('.options').style.display = 'none';
    document.querySelector('.question-settings').style.display = 'block';
    document.querySelector('.mode-toggle').style.display = 'block';

    document.getElementById('pauseGame').disabled = true;
    document.getElementById('endGame').disabled = true;
    document.getElementById('questionProgress').hidden = true;
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
  document.getElementById('summaryMessage').style.display = 'none';
  document.getElementById('questionProgress').hidden = true;
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
  answeredWords = [];

  document.getElementById('vocabReview').style.display = 'none'; // 👈 Oculta el vocabulario
  document.getElementById('vocabReview').innerHTML = '';         // 👈 Limpia contenido anterior

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

  // Mostrar el resumen justo debajo de los círculos
  const summary = document.getElementById('summaryMessage');
  summary.textContent = `You answered ${questionCount} questions: ${correctAnswers} right, ${wrongAnswers} wrong.`;
  summary.style.display = 'block';

  // Mostrar los controles de modo y configuración
  document.querySelector('.mode-toggle').style.display = 'block';
  document.querySelector('.question-settings').style.display = 'block';

  // Ocultar elementos del juego
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
    return;
  }

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
  }

  const label = document.getElementById('questionLabel');
  label.classList.remove('fade');
  void label.offsetWidth;
  label.textContent = questionText;
  label.classList.add('fade');

  if (currentMode === 'Chinese') {
    label.style.fontSize = '48px';
  } else {
    label.style.fontSize = '24px';
  }

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
  });

  const progress = document.getElementById('progressFill');
  const progressValue = (currentQuestion + 1) / questionCount;
  progress.style.width = `${Math.min(progressValue, 1) * 100}%`;

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

  const correctRaw = correctText;
  answerTimeout = setTimeout(() => {
    buttons.forEach(btn => {
      const btnText = btn.textContent.trim().toLowerCase();
      const correctText = correctRaw.trim().toLowerCase();

      if (btnText === correctText) {
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
  
  answeredWords.push({
    correct: selected === correctText,
    ch: currentWord.ch,
    pin: currentWord.pin,
    en: currentWord.en
  });

  setTimeout(() => {
    currentQuestion++;
    nextQuestion();
  }, 2000);
}
