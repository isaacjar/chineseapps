// ui.js - Funciones para la interfaz de usuario
let currentGame = 1;

// Mostrar u ocultar pantallas
function showScreen(screenId) {
    // Ocultar todas las pantallas
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Mostrar la pantalla solicitada
    document.getElementById(screenId).classList.remove('hidden');
    
    // Mostrar u ocultar elementos de la barra superior según la pantalla
    if (screenId === 'menuScreen') {
        document.getElementById('btnSettings').classList.remove('hidden');
        document.getElementById('scoreDisplay').classList.add('hidden');
    } else if (screenId === 'gameScreen') {
        document.getElementById('btnSettings').classList.add('hidden');
        document.getElementById('scoreDisplay').classList.remove('hidden');
    } else {
        document.getElementById('btnSettings').classList.remove('hidden');
        document.getElementById('scoreDisplay').classList.add('hidden');
    }
}

// Ir al menú principal
function goToMenu() {
    // Detener todos los juegos activos
    stopAllGames();
    showScreen('menuScreen');
}

// Mostrar configuración
function showSettings() {
    // Detener todos los juegos activos
    stopAllGames();
    
    // Primero mostrar la pantalla, luego actualizar la UI
    showScreen('settingsScreen');
    
    // Pequeño delay para asegurar que el DOM esté renderizado
    setTimeout(() => {
        updateSettingsUI();
    }, 50);
}

// Mostrar estadísticas
function showStats() {
     // Detener todos los juegos activos
    stopAllGames();
    
    // Cargar estadísticas antes de mostrar
    loadStats();
    
    // Actualizar la visualización
    const statPercentage = document.getElementById('statPercentage');
    const statTotalPoints = document.getElementById('statTotalPoints');
    const statBestStreak = document.getElementById('statBestStreak');
    
    const percentage = userStats.totalQuestions > 0 
        ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) 
        : 0;
    
    statPercentage.textContent = `${percentage}%`;
    statTotalPoints.textContent = userStats.totalPoints;
    statBestStreak.textContent = userStats.bestStreak;
    
    showScreen('statsScreen');
}

// Mostrar toast de notificación
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Actualizar marcadores en la barra superior
function updateScoreDisplay() {
    document.getElementById('currentQuestion').textContent = `${currentQuestion}/${settings.questions}`;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('lives').textContent = lives;
}

// Cargar idioma
function loadLanguage(lang) {
    // Verificar si los datos de idioma están disponibles
    if (!window.langData || !window.langData[lang]) {
        console.error('Datos de idioma no disponibles');
        return;
    }
    
    // Actualizar todos los elementos con atributo data-lang
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (window.langData[lang][key]) {
            // Si es un input, actualizar el placeholder
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = window.langData[lang][key];
            } else {
                element.textContent = window.langData[lang][key];
            }
        }
    });
}

// Obtener traducción
function getTranslation(key) {
    if (!window.langData || !window.langData[settings.language]) {
        return key;
    }
    return window.langData[settings.language][key] || key;
}

// Inicializar la interfaz
function initUI() {
    // Configurar event listeners
    document.getElementById('logo').addEventListener('click', goToMenu);
    document.getElementById('btnSettings').addEventListener('click', showSettings);
    
    // Listeners de los botones de juegos:
    document.getElementById('btnGame1').addEventListener('click', function() {
        currentGame = 1;
        startGame1();
    });
    
    document.getElementById('btnGame2').addEventListener('click', function() {
        currentGame = 2;
        startGame2();
    });
    
    document.getElementById('btnGame3').addEventListener('click', function() {
        currentGame = 3;
        startGame3();
    });
    document.getElementById('btnStats').addEventListener('click', showStats);
    
    // Botones de configuración
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
    document.getElementById('btnResetSettings').addEventListener('click', resetSettings);
    document.getElementById('btnCancelSettings').addEventListener('click', cancelSettings);

    // Slider de dificultad (toggle)
    document.getElementById('difficultyToggle').addEventListener('change', function() {
        settings.difficulty = this.checked ? 2 : 1;
        updateDifficultyIcon();
    });
    
    // Slider de países disponibles
    document.getElementById('countryCountSlider').addEventListener('input', function() {
        document.getElementById('countryCountValue').textContent = this.value;
    });
    
    // Botones de estadísticas
    document.getElementById('btnAcceptStats').addEventListener('click', goToMenu);
    
    // Botones de game over
    document.getElementById('btnPlayAgain').addEventListener('click', function() {
        switch(currentGame) {
            case 1:
                startGame1();
                break;
            case 2:
                startGame2();
                break;
            case 3:
                startGame3();
                break;
            default:
                startGame1();
        }
    });
    document.getElementById('btnGoToMenu').addEventListener('click', goToMenu);
    
    // Sliders de configuración
    document.getElementById('questionsSlider').addEventListener('input', function() {
        document.getElementById('questionsValue').textContent = this.value;
    });
    // Difficulty switch
    document.getElementById('difficultyToggle').addEventListener('change', function() {
        settings.difficulty = this.checked ? 2 : 1;
        updateDifficultyIcon();
    });
    
        
    document.getElementById('timerSlider').addEventListener('input', function() {
        document.getElementById('timerValue').textContent = this.value + ' s';
    });
    
    document.getElementById('livesSlider').addEventListener('input', function() {
        document.getElementById('livesValue').textContent = this.value;
    });
    
    // Slider de países
    document.getElementById('countryCountSlider').addEventListener('input', function() {
        document.getElementById('countryCountValue').textContent = this.value;
    });

    // Inicializar nuevas funcionalidades
    initFeatures();
}
