// game3.js - Juego de Colores y Letras

// Variables del juego
let currentQuestionGame3 = 0;
let scoreGame3 = 0;
let streakGame3 = 0;
let bestStreakGame3 = 0;
let livesGame3 = 3;
let timerIntervalGame3;
let currentCorrectOption = null;
let colorOptions = [];

// Colores disponibles
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', 
    '#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E',
    '#0984E3', '#D63031', '#00CEC9', '#636E72'
];

// Letras disponibles
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Iniciar juego de colores y letras
function startGame3() {
    // Reiniciar variables del juego
    currentQuestionGame3 = 0;
    scoreGame3 = 0;
    streakGame3 = 0;
    livesGame3 = settings.lives;
    
    // Actualizar marcadores
    updateScoreDisplayGame3();
    
    // Ocultar botón de configuración
    document.getElementById('btnSettings').classList.add('hidden');
    
    // Mostrar marcadores
    document.getElementById('scoreDisplay').classList.remove('hidden');
    
    // Mostrar pantalla de juego
    showScreen('gameScreen');
    
    // Configurar el contenedor para los círculos de colores
    setupColorContainer();
    
    // Cargar primera pregunta
    loadNextQuestionGame3();
}

// Configurar contenedor de colores
function setupColorContainer() {
    const flagContainer = document.getElementById('flagContainer');
    flagContainer.innerHTML = `
        <div class="color-game-container">
            <div class="color-circles" id="colorCircles"></div>
        </div>
    `;
}

// Cargar siguiente pregunta
function loadNextQuestionGame3() {
    if (currentQuestionGame3 >= settings.questions || livesGame3 <= 0) {
        endGameGame3();
        return;
    }
    
    currentQuestionGame3++;
    document.getElementById('currentQuestion').textContent = `${currentQuestionGame3}/${settings.questions}`;
    
    // Generar opciones de colores y letras
    generateColorOptions();
    
    // Mostrar círculos de colores
    displayColorCircles();
    
    // Mostrar opciones de letras
    displayLetterOptions();
    
    // Iniciar temporizador
    startTimerGame3();
}

// Generar opciones de colores y letras
function generateColorOptions() {
    const optionCount = settings.difficulty === 1 ? 4 : 6;
    colorOptions = [];
    
    // Mezclar colores y letras
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const shuffledLetters = [...LETTERS].sort(() => Math.random() - 0.5);
    
    // Crear opciones únicas
    for (let i = 0; i < optionCount; i++) {
        colorOptions.push({
            color: shuffledColors[i],
            letter: shuffledLetters[i],
            isCorrect: false
        });
    }
    
    // Seleccionar una opción correcta aleatoria
    const correctIndex = Math.floor(Math.random() * optionCount);
    currentCorrectOption = colorOptions[correctIndex];
    currentCorrectOption.isCorrect = true;
}

// Mostrar círculos de colores
function displayColorCircles() {
    const colorCirclesContainer = document.getElementById('colorCircles');
    colorCirclesContainer.innerHTML = '';
    
    colorOptions.forEach((option, index) => {
        const circle = document.createElement('div');
        circle.className = 'color-circle';
        circle.style.backgroundColor = option.color;
        circle.dataset.index = index;
        colorCirclesContainer.appendChild(circle);
    });
    
    // Ajustar grid según la dificultad
    if (settings.difficulty === 1) {
        colorCirclesContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
        colorCirclesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    }
}

// Mostrar opciones de letras
function displayLetterOptions() {
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    // Texto de la pregunta
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `<p>${getTranslation('selectColorForLetter')} <strong>${currentCorrectOption.letter}</strong></p>`;
    optionsContainer.appendChild(questionText);
    
    // Crear botones de opciones
    colorOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn color-option-btn';
        button.innerHTML = `
            <span class="option-letter">${option.letter}</span>
            <span class="option-color" style="background-color: ${option.color}"></span>
        `;
        
        button.addEventListener('click', function() {
            checkAnswerGame3(option, currentCorrectOption);
        });
        
        optionsContainer.appendChild(button);
    });
}

// Comprobar respuesta
function checkAnswerGame3(selectedOption, correctOption) {
    clearInterval(timerIntervalGame3);
    
    // Deshabilitar botones
    const buttons = document.querySelectorAll('.color-option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        const btnLetter = btn.querySelector('.option-letter').textContent;
        
        if (btnLetter === correctOption.letter) {
            btn.classList.add('correct');
        } else if (btnLetter === selectedOption.letter && selectedOption !== correctOption) {
            btn.classList.add('incorrect');
        }
    });
    
    // Resaltar círculo correcto
    const circles = document.querySelectorAll('.color-circle');
    colorOptions.forEach((option, index) => {
        if (option.isCorrect) {
            circles[index].classList.add('correct-circle');
        }
    });
    
    // Comprobar si es correcta
    if (selectedOption === correctOption) {
        // Respuesta correcta
        scoreGame3 += 10 * (streakGame3 + 1);
        streakGame3++;
        if (streakGame3 > bestStreakGame3) {
            bestStreakGame3 = streakGame3;
        }
        showToast(getTranslation('correctAnswer'));
    } else {
        // Respuesta incorrecta
        livesGame3--;
        streakGame3 = 0;
        showToast(getTranslation('incorrectAnswer'));
    }
    
    // Actualizar marcadores
    updateScoreDisplayGame3();
    
    // Siguiente pregunta después de un breve delay
    setTimeout(() => {
        loadNextQuestionGame3();
    }, 2000);
}

// Iniciar temporizador
function startTimerGame3() {
    const timerBar = document.getElementById('timerBar');
    let timeLeft = settings.timer;
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#7FB3D5';
    
    timerIntervalGame3 = setInterval(() => {
        timeLeft -= 0.1;
        const percentage = (timeLeft / settings.timer) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (percentage < 30) {
            timerBar.style.backgroundColor = '#E74C3C';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerIntervalGame3);
            livesGame3--;
            streakGame3 = 0;
            updateScoreDisplayGame3();
            showToast(getTranslation('timeUp'));
            
            setTimeout(() => {
                loadNextQuestionGame3();
            }, 1500);
        }
    }, 100);
}

// Actualizar marcadores
function updateScoreDisplayGame3() {
    document.getElementById('currentQuestion').textContent = `${currentQuestionGame3}/${settings.questions}`;
    document.getElementById('score').textContent = scoreGame3;
    document.getElementById('streak').textContent = streakGame3;
    document.getElementById('lives').textContent = livesGame3;
}

// Finalizar juego
function endGameGame3() {
    // Guardar estadísticas
    saveStatsGame3();
    
    // Mostrar pantalla de fin de juego
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const finalPercentage = document.getElementById('finalPercentage');
    const finalPoints = document.getElementById('finalPoints');
    const finalStreak = document.getElementById('finalStreak');
    
    if (livesGame3 <= 0) {
        gameOverTitle.textContent = getTranslation('gameOver');
    } else {
        gameOverTitle.textContent = getTranslation('endOfGame');
    }
    
    const percentage = currentQuestionGame3 > 0 ? Math.round((scoreGame3 / (currentQuestionGame3 * 10)) * 100) : 0;
    finalPercentage.textContent = `${percentage}%`;
    finalPoints.textContent = scoreGame3;
    finalStreak.textContent = bestStreakGame3;
    
    showScreen('gameOverScreen');
}

// Guardar estadísticas para juego 3
function saveStatsGame3() {
    userStats.totalQuestions += currentQuestionGame3;
    userStats.correctAnswers += Math.floor(scoreGame3 / 10);
    userStats.totalPoints += scoreGame3;
    if (bestStreakGame3 > userStats.bestStreak) {
        userStats.bestStreak = bestStreakGame3;
    }
    
    localStorage.setItem('chinexplora_stats', JSON.stringify(userStats));
}
