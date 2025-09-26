// game3.js - Juego de Lugares en China (Versión Corregida)

// Variables del juego
let currentQuestionGame3 = 0;
let scoreGame3 = 0;
let streakGame3 = 0;
let bestStreakGame3 = 0;
let livesGame3 = 3;
let timerIntervalGame3;
let currentCorrectPlace = null;
let placesData = [];
let mapImageLoaded = false;

// Iniciar juego de lugares en China
function startGame3() {
    // Reiniciar variables del juego
    currentQuestionGame3 = 0;
    scoreGame3 = 0;
    streakGame3 = 0;
    livesGame3 = settings.lives;
    
    // Cargar datos de lugares
    loadPlacesData();
    
    // Actualizar marcadores
    updateScoreDisplayGame3();
    
    // Ocultar botón de configuración
    document.getElementById('btnSettings').classList.add('hidden');
    
    // Mostrar marcadores
    document.getElementById('scoreDisplay').classList.remove('hidden');
    
    // Mostrar pantalla de juego
    showScreen('gameScreen');
    
    // Configurar el contenedor para el mapa de China
    setupMapContainer();
    
    // Cargar primera pregunta después de cargar el mapa
    setTimeout(() => {
        loadNextQuestionGame3();
    }, 500);
}

// Cargar datos de lugares
async function loadPlacesData() {
    try {
        // Intentar cargar desde places.json
        const response = await fetch('js/places.json');
        if (response.ok) {
            placesData = await response.json();
        } else {
            // Datos de respaldo si el archivo no existe
            placesData = [
                {
                    "ch": "北京",
                    "pin": "Běijīng",
                    "en": "Beijing",
                    "sp": "Pekín",
                    "x": 235,
                    "y": 95
                },
                {
                    "ch": "上海",
                    "pin": "Shànghǎi",
                    "en": "Shanghai",
                    "sp": "Shanghái",
                    "x": 320,
                    "y": 200
                },
                {
                    "ch": "广州",
                    "pin": "Guǎngzhōu",
                    "en": "Guangzhou",
                    "sp": "Cantón",
                    "x": 250,
                    "y": 300
                },
                {
                    "ch": "成都",
                    "pin": "Chéngdū",
                    "en": "Chengdu",
                    "sp": "Chengdú",
                    "x": 150,
                    "y": 220
                },
                {
                    "ch": "西安",
                    "pin": "Xī'ān",
                    "en": "Xi'an",
                    "sp": "Xi'an",
                    "x": 180,
                    "y": 150
                },
                {
                    "ch": "拉萨",
                    "pin": "Lāsà",
                    "en": "Lhasa",
                    "sp": "Lhasa",
                    "x": 80,
                    "y": 180
                },
                {
                    "ch": "香港",
                    "pin": "Xiānggǎng",
                    "en": "Hong Kong",
                    "sp": "Hong Kong",
                    "x": 280,
                    "y": 320
                },
                {
                    "ch": "台北",
                    "pin": "Táiběi",
                    "en": "Taipei",
                    "sp": "Taipéi",
                    "x": 380,
                    "y": 280
                }
            ];
        }
    } catch (error) {
        console.error('Error loading places data:', error);
        // Usar datos mínimos de respaldo
        placesData = [
            {"ch": "北京", "pin": "Běijīng", "en": "Beijing", "sp": "Pekín", "x": 235, "y": 95},
            {"ch": "上海", "pin": "Shànghǎi", "en": "Shanghai", "sp": "Shanghái", "x": 320, "y": 200}
        ];
    }
}

// Configurar contenedor del mapa
function setupMapContainer() {
    const flagContainer = document.getElementById('flagContainer');
    flagContainer.innerHTML = `
        <div class="map-game-container">
            <img src="flags/aachinamap.png" alt="Mapa de China" class="china-map flag-game3" id="chinaMap">
            <svg class="points-overlay" id="pointsOverlay" width="300" height="200" viewBox="0 0 500 400"></svg>
        </div>
    `;
    
    // Asegurar que la imagen se cargue
    const mapImage = document.getElementById('chinaMap');
    mapImage.onload = function() {
        mapImageLoaded = true;
    };
    mapImage.onerror = function() {
        console.error('Error loading China map image');
        // Mostrar un fondo alternativo
        flagContainer.innerHTML = '<div class="map-placeholder">🗺️ Mapa de China</div>';
        mapImageLoaded = true;
    };
}

// Cargar siguiente pregunta
function loadNextQuestionGame3() {
    if (currentQuestionGame3 >= settings.questions || livesGame3 <= 0 || placesData.length === 0) {
        endGameGame3();
        return;
    }
    
    currentQuestionGame3++;
    document.getElementById('currentQuestion').textContent = `${currentQuestionGame3}/${settings.questions}`;
    
    // Seleccionar lugar aleatorio
    const randomIndex = Math.floor(Math.random() * placesData.length);
    currentCorrectPlace = placesData[randomIndex];
    
    // Mostrar el mapa con el punto
    displayMapWithPoint();
    
    // Generar y mostrar opciones
    generatePlaceOptions();
    
    // Iniciar temporizador
    startTimerGame3();
}

// Mostrar mapa con punto de ubicación
function displayMapWithPoint() {
    const pointsOverlay = document.getElementById('pointsOverlay');
    pointsOverlay.innerHTML = '';
    
    // Crear punto de ubicación (más pequeño)
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", currentCorrectPlace.x);
    point.setAttribute("cy", currentCorrectPlace.y);
    point.setAttribute("r", "8"); // Punto más pequeño (era 15)
    point.setAttribute("fill", "#E74C3C");
    point.setAttribute("stroke", "#FFFFFF");
    point.setAttribute("stroke-width", "2");
    point.setAttribute("class", "location-point");
    
    // Añadir animación sutil
    point.setAttribute("filter", "url(#glow)");
    
    // Crear filtro de resplandor
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "glow");
    filter.innerHTML = `
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
        <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    `;
    defs.appendChild(filter);
    pointsOverlay.appendChild(defs);
    pointsOverlay.appendChild(point);
}

// Generar opciones de lugares
function generatePlaceOptions() {
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    // Texto de la pregunta
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `<p>${getTranslation('selectCityForPoint')} <strong>📍</strong></p>`;
    optionsContainer.appendChild(questionText);
    
    // Generar opciones
    const optionCount = settings.difficulty === 1 ? 4 : 6;
    const placeOptions = [currentCorrectPlace];
    
    // Añadir opciones incorrectas
    while (placeOptions.length < Math.min(optionCount, placesData.length)) {
        const randomPlace = placesData[Math.floor(Math.random() * placesData.length)];
        if (!placeOptions.find(p => p.ch === randomPlace.ch)) {
            placeOptions.push(randomPlace);
        }
    }
    
    // Mezclar opciones
    shuffleArray(placeOptions);
    
    // Crear botones de opciones
    placeOptions.forEach(place => {
        const button = document.createElement('button');
        button.className = 'option-btn place-option-btn';
        
        // Mostrar nombre según configuración
        let displayName = place.ch;
        if (settings.pinyin) {
            displayName += ` [${place.pin}]`;
        }
        
        button.textContent = displayName;
        button.addEventListener('click', function() {
            checkAnswerGame3(place, currentCorrectPlace);
        });
        
        optionsContainer.appendChild(button);
    });
}

// Comprobar respuesta
function checkAnswerGame3(selectedPlace, correctPlace) {
    clearInterval(timerIntervalGame3);
    
    // Deshabilitar botones
    const buttons = document.querySelectorAll('.place-option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        
        // Obtener el texto del botón sin el pinyin
        let buttonText = btn.textContent;
        if (buttonText.includes('[')) {
            buttonText = buttonText.split('[')[0].trim();
        }
        
        if (buttonText === correctPlace.ch) {
            btn.classList.add('correct');
        } else if (buttonText === selectedPlace.ch && selectedPlace !== correctPlace) {
            btn.classList.add('incorrect');
        }
    });
    
    // Resaltar punto correcto en el mapa
    const point = document.querySelector('.location-point');
    if (point) {
        point.style.fill = '#27ae60'; // Verde para correcto
        point.setAttribute('r', '10'); // Agrandar ligeramente
    }
    
    // Comprobar si es correcta
    if (selectedPlace === correctPlace) {
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
        
        // Mostrar también el punto correcto
        const correctPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        correctPoint.setAttribute("cx", correctPlace.x);
        correctPoint.setAttribute("cy", correctPlace.y);
        correctPoint.setAttribute("r", "6");
        correctPoint.setAttribute("fill", "#27ae60");
        correctPoint.setAttribute("stroke", "#FFFFFF");
        correctPoint.setAttribute("stroke-width", "2");
        document.getElementById('pointsOverlay').appendChild(correctPoint);
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

// Función auxiliar para mezclar arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
