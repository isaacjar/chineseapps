let currentMode = 'Pinyin';
let questionCount = parseInt(localStorage.getItem('questionCount')) || 20;
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentWord = null;
let answerTimeout;

document.addEventListener('DOMContentLoaded', () => {
  const defaultModeBtn = document.getElementById('modePinyin');
  defaultModeBtn.classList.add('active');
  currentMode = 'Pinyin';
  updateModeLabel();
  document.getElementById('questionCount').textContent = questionCount;
  hideGameElements();

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
    showGameElements();
    startGame();
  };

  document.getElementById('endGame').onclick = endGame;

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
  // Sonido desactivado temporalmente
  // document.getElementById(isCorrect ? 'correctSound' : 'wrongSound').play();
}

function showResults() {
  document.getElementById('results').hidden = false;
  document.getElementById('results').textContent =
    `Correct: ${correctAnswers} | Incorrect: ${wrongAnswers}`;
}

function endGame() {
  showResults();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function nextQuestion() {
  clearTimeout(answerTimeout);

  if (currentQuestion >= questionCount) {
    showResults();
    return;
  }

  const progress = document.getElementById('progressFill');
  progress.style.width = `${(currentQuestion / questionCount) * 100}%`;

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

  // ⏱ Si no responde en 5 segundos, mostrar solución
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

  const buttons = document.querySelectorAll('.option');
  buttons.forEach(btn => btn.disabled = true);

  let correct;
  switch (currentMode) {
    case 'Chinese': correct = currentWord.pin; break;
    case 'Pinyin': correct = currentWord.en; break;
    case 'English': correct = `${currentWord.ch} [${currentWord.pin}]`; break;
  }

  buttons.forEach(btn => {
    if (btn.textContent === correct) {
      btn.classList.add(selectedText === correct ? 'correct' : 'missed');
    } else if (btn.textContent === selectedText) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('incorrect');
    }
  });

  if (selectedText === correct) {
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
