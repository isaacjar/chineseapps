// Constante con el número máximo de países
let MAX_COUNTRIES = 135;

// Variables del juego
let currentQuestion = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let lives = 3;
let timerInterval;
let countries = [];
let currentOptions = [];

// Iniciar juego de banderas
function startGame1() {
    // Actualizar MAX_COUNTRIES con el número real de países cargados
    MAX_COUNTRIES = window.countriesData ? window.countriesData.length : 135;
    
    // Verificar que countriesData está cargado
    if (!window.countriesData || window.countriesData.length === 0) {
        console.error('Countries data not loaded');
        showToast('Error loading countries data');
        return;
    }
    
    // Reiniciar variables del juego
    currentQuestion = 0;
    score = 0;
    streak = 0;
    lives = settings.lives;
    
    // Cargar países
    if (window.countriesData) {
        // Seleccionar países según la configuración
        const countriesToSelect = Math.min(settings.countryCount, MAX_COUNTRIES);
        countries = window.countriesData.slice(0, countriesToSelect);
    } else {
        // Datos de ejemplo si no se carga el JSON
        countries = [
            { ch: "中国", pin: "Zhōngguó", en: "China", sp: "China", fileflag: "china.png" },
            { ch: "美国", pin: "Měiguó", en: "United States", sp: "Estados Unidos", fileflag: "usa.png" },
            { ch: "西班牙", pin: "Xībānyá", en: "Spain", sp: "España", fileflag: "spain.png" },
            { ch: "法国", pin: "Fǎguó", en: "France", sp: "Francia", fileflag: "france.png" },
            { ch: "德国", pin: "Déguó", en: "Germany", sp: "Alemania", fileflag: "germany.png" },
            { ch: "日本", pin: "Rìběn", en: "Japan", sp: "Japón", fileflag: "japan.png" },
            { ch: "意大利", pin: "Yìdàlì", en: "Italy", sp: "Italia", fileflag: "italy.png" },
            { ch: "英国", pin: "Yīngguó", en: "United Kingdom", sp: "Reino Unido", fileflag: "uk.png" },
            { ch: "巴西", pin: "Bāxī", en: "Brazil", sp: "Brasil", fileflag: "brazil.png" },
            { ch: "俄罗斯", pin: "Éluósī", en: "Russia", sp: "Rusia", fileflag: "russia.png" }
        ];
    }
    
    // Actualizar marcadores
    updateScoreDisplay();
    
    // Ocultar botón de configuración
    document.getElementById('btnSettings').classList.add('hidden');
    
    // Mostrar marcadores
    document.getElementById('scoreDisplay').classList.remove('hidden');
    
    // Mostrar pantalla de juego
    showScreen('gameScreen');
    
    // Cargar primera pregunta
    loadNextQuestion();
}

// Cargar siguiente pregunta
function loadNextQuestion() {
    if (currentQuestion >= settings.questions || lives <= 0) {
        endGame();
        return;
    }
    
    currentQuestion++;
    document.getElementById('currentQuestion').textContent = `${currentQuestion}/${settings.questions}`;
    
    // Seleccionar país aleatorio
    const randomIndex = Math.floor(Math.random() * countries.length);
    const correctCountry = countries[randomIndex];
    
    // Cargar bandera
    document.getElementById('flagImage').src = `flags/${correctCountry.fileflag}`;
    document.getElementById('flagImage').alt = correctCountry.sp;
    
    // Generar opciones
    currentOptions = [correctCountry];
    
    // Añadir opciones incorrectas
    const optionCount = settings.difficulty === 1 ? 4 : 6;
    while (currentOptions.length < optionCount) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        if (!currentOptions.includes(randomCountry)) {
            currentOptions.push(randomCountry);
        }
    }
    
    // Mezclar opciones
    shuffleArray(currentOptions);
    
    // Mostrar opciones
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    currentOptions.forEach(country => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        
        // Mostrar nombre según configuración de pinyin
        let displayName = country.ch;  // Siempre mostrar caracteres chinos
        if (settings.pinyin) {
            displayName += ` [${country.pin}]`;  // Añadir pinyin si está activado
        }
        
        button.textContent = displayName;
        button.addEventListener('click', function() {
            checkAnswer(country, correctCountry);
        });
        
        optionsContainer.appendChild(button);
    });
    
    // Iniciar temporizador
    startTimer();
}

// Comprobar respuesta
function checkAnswer(selectedCountry, correctCountry) {
    clearInterval(timerInterval);
    
    // Deshabilitar botones
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        // Obtener el texto del botón sin el pinyin (si existe)
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
        score += 10 * (streak + 1); // Puntos extra por racha
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        showToast(getTranslation('correctAnswer'));
    } else {
        // Respuesta incorrecta
        lives--;
        streak = 0;
        showToast(getTranslation('incorrectAnswer'));
    }
    
    // Actualizar marcadores
    updateScoreDisplay();
    
    // Siguiente pregunta después de un breve delay
    setTimeout(() => {
        loadNextQuestion();
    }, 1500);
}

// Iniciar temporizador
function startTimer() {
    const timerBar = document.getElementById('timerBar');
    let timeLeft = settings.timer;
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#7FB3D5'; // Color azul
    
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percentage = (timeLeft / settings.timer) * 100;
        timerBar.style.width = `${percentage}%`;
        
        // Cambiar color cuando queda poco tiempo
        if (percentage < 30) {
            timerBar.style.backgroundColor = '#E74C3C';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Tiempo agotado
            lives--;
            streak = 0;
            updateScoreDisplay();
            showToast(getTranslation('timeUp'));
            
            // Siguiente pregunta después de un breve delay
            setTimeout(() => {
                loadNextQuestion();
            }, 1500);
        }
    }, 100);
}

// Finalizar juego
function endGame() {
    // Guardar estadísticas
    saveStats();
    
    // Mostrar pantalla de fin de juego
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const finalPercentage = document.getElementById('finalPercentage');
    const finalPoints = document.getElementById('finalPoints');
    const finalStreak = document.getElementById('finalStreak');
    
    if (lives <= 0) {
        gameOverTitle.textContent = getTranslation('gameOver');
    } else {
        gameOverTitle.textContent = getTranslation('endOfGame');
    }
    
    const percentage = currentQuestion > 0 ? Math.round((score / (currentQuestion * 10)) * 100) : 0;
    finalPercentage.textContent = `${percentage}%`;
    finalPoints.textContent = score;
    finalStreak.textContent = bestStreak;
    
    showScreen('gameOverScreen');
}

// Mezclar array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

