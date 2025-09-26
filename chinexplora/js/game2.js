// game2.js - Juego de Siluetas de Países (Versión Corregida)

// Variables del juego
let currentQuestionGame2 = 0;
let scoreGame2 = 0;
let streakGame2 = 0;
let bestStreakGame2 = 0;
let livesGame2 = 3;
let countriesGame2 = [];
let currentOptionsGame2 = [];
let timerIntervalGame2 = null;
let isGame2Active = false;

// Iniciar juego de siluetas
function startGame2() {
    // Detener cualquier juego anterior que esté activo
    stopAllGames();

    // Marcar que el juego 2 está activo
    isGame2Active = true;
    
    // Reiniciar variables del juego
    currentQuestionGame2 = 0;
    scoreGame2 = 0;
    streakGame2 = 0;
    livesGame2 = settings.lives;
    
    // Verificar que countriesData está cargado y tiene outlines
    if (!window.countriesData || window.countriesData.length === 0) {
        console.error('Countries data not loaded');
        showToast('Error loading countries data');
        isGame2Active = false;
        return;
    }
    
    // Filtrar países que tienen outline
    const countriesWithOutline = window.countriesData.filter(country => country.outline);
    if (countriesWithOutline.length === 0) {
        showToast('No country outlines available');
        isGame2Active = false;
        return;
    }
    
    // Seleccionar países según la configuración
    const maxCountries = Math.min(settings.countryCount, countriesWithOutline.length);
    countriesGame2 = countriesWithOutline.slice(0, maxCountries);
    
    // Actualizar marcadores
    updateScoreDisplayGame2();
    
    // Ocultar botón de configuración
    document.getElementById('btnSettings').classList.add('hidden');
    
    // Mostrar marcadores
    document.getElementById('scoreDisplay').classList.remove('hidden');
    
    // Mostrar pantalla de juego
    showScreen('gameScreen');
    
    // Cargar primera pregunta
    loadNextQuestionGame2();
}

// Cargar siguiente pregunta
function loadNextQuestionGame2() {
    // Verificar si el juego sigue activo
    if (!isGame2Active) {
        return;
    }
    
    if (currentQuestionGame2 >= settings.questions || livesGame2 <= 0) {
        endGameGame2();
        return;
    }
    
    currentQuestionGame2++;
    document.getElementById('currentQuestion').textContent = `${currentQuestionGame2}/${settings.questions}`;
    
    // Seleccionar país aleatorio con outline
    const countriesWithOutline = countriesGame2.filter(country => country.outline);
    if (countriesWithOutline.length === 0) {
        endGameGame2();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * countriesWithOutline.length);
    const correctCountry = countriesWithOutline[randomIndex];
    
    // Dibujar silueta del país
    drawCountryOutline(correctCountry.fileflag);
    
    // Generar opciones
    currentOptionsGame2 = [correctCountry];
    
    // Añadir opciones incorrectas
    const optionCount = settings.difficulty === 1 ? 4 : 6;
    while (currentOptionsGame2.length < optionCount) {
        const randomCountry = countriesWithOutline[Math.floor(Math.random() * countriesWithOutline.length)];
        if (!currentOptionsGame2.includes(randomCountry)) {
            currentOptionsGame2.push(randomCountry);
        }
    }
    
    // Mezclar opciones
    shuffleArray(currentOptionsGame2);
    
    // Mostrar opciones
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    currentOptionsGame2.forEach(country => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        
        // Mostrar nombre según configuración de pinyin
        let displayName = country.ch;
        if (settings.pinyin) {
            displayName += ` [${country.pin}]`;
        }
        
        button.textContent = displayName;
        button.addEventListener('click', function() {
            checkAnswerGame2(country, correctCountry);
        });
        
        optionsContainer.appendChild(button);
    });
    
    // Iniciar temporizador
    startTimerGame2();
}

// Dibujar silueta del país - VERSIÓN MEJORADA
function drawCountryOutline(fileflag) {
    const flagContainer = document.getElementById('flagContainer');
    
    // Limpiar contenedor
    flagContainer.innerHTML = '';
    
    // Crear imagen de la silueta
    const img = document.createElement('img');
    img.src = `outline/${fileflag}`;
    img.alt = 'Country outline';
    img.classList.add('country-outline', 'flag-game2');
    img.style.filter = 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))';
    
    flagContainer.appendChild(img);
}

// Comprobar respuesta
function checkAnswerGame2(selectedCountry, correctCountry) {
    if (!isGame2Active) return;
    
    clearInterval(timerIntervalGame2);
    
    // Deshabilitar botones
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        
        // Obtener el texto del botón sin el pinyin
        let buttonText = btn.textContent;
        if (buttonText.includes('[')) {
            buttonText = buttonText.split('[')[0].trim();
        }
        
        // Comprobar si es la respuesta correcta
        if (buttonText === correctCountry.ch) {
            btn.classList.add('correct');
        } 
        // Comprobar si es la respuesta seleccionada e incorrecta
        else if (buttonText === selectedCountry.ch && selectedCountry !== correctCountry) {
            btn.classList.add('incorrect');
        }
    });
    
    // Comprobar si es correcta
    if (selectedCountry === correctCountry) {
        // Respuesta correcta
        scoreGame2 += 10 * (streakGame2 + 1);
        streakGame2++;
        if (streakGame2 > bestStreakGame2) {
            bestStreakGame2 = streakGame2;
        }
        showToast(getTranslation('correctAnswer'));
    } else {
        // Respuesta incorrecta
        livesGame2--;
        streakGame2 = 0;
        showToast(getTranslation('incorrectAnswer'));
    }
    
    // Actualizar marcadores
    updateScoreDisplayGame2();
    
    // Siguiente pregunta después de un breve delay
    setTimeout(() => {
        loadNextQuestionGame2();
    }, 1500);
}

// Iniciar temporizador
function startTimerGame2() {
    // Limpiar temporizador anterior si existe
    if (timerIntervalGame2) {
        clearInterval(timerIntervalGame2);
    }
    
    const timerBar = document.getElementById('timerBar');
    let timeLeft = settings.timer;
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#7FB3D5';
    
    timerIntervalGame2 = setInterval(() => {
        // Verificar si el juego sigue activo
        if (!isGame2Active) {
            clearInterval(timerIntervalGame2);
            return;
        }
        
        timeLeft -= 0.1;
        const percentage = (timeLeft / settings.timer) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (percentage < 30) {
            timerBar.style.backgroundColor = '#E74C3C';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerIntervalGame2);
            livesGame2--;
            streakGame2 = 0;
            updateScoreDisplayGame2();
            showToast(getTranslation('timeUp'));
            
            setTimeout(() => {
                loadNextQuestionGame2();
            }, 1500);
        }
    }, 100);
}

// Actualizar marcadores
function updateScoreDisplayGame2() {
    document.getElementById('currentQuestion').textContent = `${currentQuestionGame2}/${settings.questions}`;
    document.getElementById('score').textContent = scoreGame2;
    document.getElementById('streak').textContent = streakGame2;
    document.getElementById('lives').textContent = livesGame2;
}

// Finalizar juego
function endGameGame2() {
    isGame2Active = false;
    
    // Guardar estadísticas
    saveStatsGame2();
    
    // Mostrar pantalla de fin de juego
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const finalPercentage = document.getElementById('finalPercentage');
    const finalPoints = document.getElementById('finalPoints');
    const finalStreak = document.getElementById('finalStreak');
    
    if (livesGame2 <= 0) {
        gameOverTitle.textContent = getTranslation('gameOver');
    } else {
        gameOverTitle.textContent = getTranslation('endOfGame');
    }
    
    const percentage = currentQuestionGame2 > 0 ? Math.round((scoreGame2 / (currentQuestionGame2 * 10)) * 100) : 0;
    finalPercentage.textContent = `${percentage}%`;
    finalPoints.textContent = scoreGame2;
    finalStreak.textContent = bestStreakGame2;
    
    showScreen('gameOverScreen');
}

// Guardar estadísticas para juego 2
function saveStatsGame2() {
    userStats.totalQuestions += currentQuestionGame2;
    userStats.correctAnswers += Math.floor(scoreGame2 / 10);
    userStats.totalPoints += scoreGame2;
    if (bestStreakGame2 > userStats.bestStreak) {
        userStats.bestStreak = bestStreakGame2;
    }
    
    localStorage.setItem('chinexplora_stats', JSON.stringify(userStats));
}

// Función para detener el juego 2
function stopGame2() {
    if (timerIntervalGame2) {
        clearInterval(timerIntervalGame2);
        timerIntervalGame2 = null;
    }
    isGame2Active = false;
}

// Función auxiliar para mezclar arrays (si no está definida)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
