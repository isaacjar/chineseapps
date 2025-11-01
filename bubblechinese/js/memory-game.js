// Estado del juego de memoria
const memoryGame = {
    config: {
        selectedGroups: new Set(),
        pairsCount: 8,
        matchMode: 'pinyin',
        difficulty: 'easy',
        viewTime: 8 // segundos para ver las cartas al inicio
    },
    game: {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: null,
        timeElapsed: 0,
        isPaused: false,
        canFlip: true
    },
    characters: []
};

// Inicializar el juego
async function initMemoryGame() {
    await loadCharactersForGame();
    setupEventListeners();
    showConfigScreen();
    updateGroupsSelection();
}

// Cargar caracteres para el juego
async function loadCharactersForGame() {
    try {
        const response = await fetch('js/chars.json');
        if (response.ok) {
            memoryGame.characters = await response.json();
        } else {
            throw new Error('Error cargando caracteres');
        }
    } catch (error) {
        console.error('Error al cargar caracteres:', error);
        // Usar datos de respaldo mínimos
        memoryGame.characters = [
            { ch: '你', pin: 'nǐ', en: 'you', es: 'tú', lv: '1', gr: '001' },
            { ch: '好', pin: 'hǎo', en: 'good', es: 'bueno', lv: '1', gr: '001' },
            { ch: '我', pin: 'wǒ', en: 'I/me', es: 'yo/mí', lv: '1', gr: '001' }
        ];
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación
    document.getElementById('backToMain').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Configuración
    document.getElementById('startGame').addEventListener('click', startGame);
    
    // Botones de número de parejas
    document.querySelectorAll('.pairs-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pairs-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            memoryGame.config.pairsCount = parseInt(e.target.dataset.pairs);
        });
    });

    // Controles del juego
    document.getElementById('pauseGame').addEventListener('click', pauseGame);
    document.getElementById('resumeGame').addEventListener('click', resumeGame);
    document.getElementById('restartGame').addEventListener('click', restartGame);
    document.getElementById('newGame').addEventListener('click', showConfigScreen);
    document.getElementById('playAgain').addEventListener('click', restartGame);
    document.getElementById('backToConfig').addEventListener('click', showConfigScreen);
}

// Mostrar pantalla de configuración
function showConfigScreen() {
    hideAllScreens();
    document.getElementById('configScreen').classList.add('active');
    updateGroupsSelection();
}

// Actualizar selección de grupos
function updateGroupsSelection() {
    const container = document.getElementById('gameGroupsContainer');
    container.innerHTML = '';

    const groups = [...new Set(memoryGame.characters.map(char => char.gr))].sort();
    
    groups.forEach(group => {
        const groupChars = memoryGame.characters.filter(char => char.gr === group);
        const groupBtn = document.createElement('div');
        groupBtn.className = `group-option ${memoryGame.config.selectedGroups.has(group) ? 'selected' : ''}`;
        groupBtn.innerHTML = `
            <div>Grupo ${group}</div>
            <small>${groupChars.length} chars</small>
        `;
        
        groupBtn.addEventListener('click', () => {
            groupBtn.classList.toggle('selected');
            if (memoryGame.config.selectedGroups.has(group)) {
                memoryGame.config.selectedGroups.delete(group);
            } else {
                memoryGame.config.selectedGroups.add(group);
            }
        });
        
        container.appendChild(groupBtn);
    });
}

// Ocultar todas las pantallas
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Iniciar juego
function startGame() {
    if (memoryGame.config.selectedGroups.size === 0) {
        alert('Por favor selecciona al menos un grupo de caracteres.');
        return;
    }

    // Obtener configuración de modo de emparejamiento y dificultad
    const matchMode = document.querySelector('input[name="matchMode"]:checked').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    memoryGame.config.matchMode = matchMode;
    memoryGame.config.difficulty = difficulty;
    
    // Configurar tiempo de vista según dificultad
    switch(difficulty) {
        case 'easy':
            memoryGame.config.viewTime = 8;
            break;
        case 'medium':
            memoryGame.config.viewTime = 6;
            break;
        case 'hard':
            memoryGame.config.viewTime = 4;
            break;
    }

    // Preparar cartas del juego
    prepareGameCards();
    
    // Mostrar pantalla de juego
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    
    // Iniciar juego
    startGameSession();
}

// Preparar cartas del juego
function prepareGameCards() {
    // Obtener caracteres de los grupos seleccionados
    const availableChars = memoryGame.characters.filter(char => 
        memoryGame.config.selectedGroups.has(char.gr)
    );

    if (availableChars.length === 0) {
        alert('No hay caracteres disponibles en los grupos seleccionados.');
        return;
    }

    // Seleccionar caracteres aleatorios
    const selectedChars = [];
    const charCount = Math.min(memoryGame.config.pairsCount, availableChars.length);
    
    // Mezclar y seleccionar caracteres
    const shuffled = [...availableChars].sort(() => Math.random() - 0.5);
    for (let i = 0; i < charCount; i++) {
        selectedChars.push(shuffled[i]);
    }

    // Crear pares de cartas
    memoryGame.game.cards = [];
    selectedChars.forEach(char => {
        // Carta con carácter chino
        memoryGame.game.cards.push({
            id: `${char.ch}-ch`,
            type: 'chinese',
            content: char.ch,
            pairId: char.ch,
            matched: false
        });

        // Carta con traducción según el modo
        let translationContent = '';
        let translationType = '';
        
        switch(memoryGame.config.matchMode) {
            case 'pinyin':
                translationContent = char.pin;
                translationType = 'pinyin';
                break;
            case 'english':
                translationContent = char.en;
                translationType = 'english';
                break;
            case 'spanish':
                translationContent = char.es;
                translationType = 'spanish';
                break;
        }

        memoryGame.game.cards.push({
            id: `${char.ch}-trans`,
            type: translationType,
            content: translationContent,
            pairId: char.ch,
            matched: false
        });
    });

    // Mezclar cartas
    memoryGame.game.cards = memoryGame.game.cards.sort(() => Math.random() - 0.5);
}

// Iniciar sesión de juego
function startGameSession() {
    // Reiniciar estado del juego
    memoryGame.game.matchedPairs = 0;
    memoryGame.game.moves = 0;
    memoryGame.game.timeElapsed = 0;
    memoryGame.game.flippedCards = [];
    memoryGame.game.isPaused = false;
    memoryGame.game.canFlip = false;

    // Actualizar UI
    updateGameStats();
    
    // Renderizar tablero
    renderGameBoard();
    
    // Mostrar cartas temporalmente
    showCardsTemporarily();
    
    // Iniciar temporizador
    startTimer();
}

// Mostrar cartas temporalmente al inicio
function showCardsTemporarily() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });

    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flipped');
        });
        memoryGame.game.canFlip = true;
    }, memoryGame.config.viewTime * 1000);
}

// Renderizar tablero de juego
function renderGameBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    // Determinar layout del grid según número de parejas
    const pairs = memoryGame.config.pairsCount;
    board.className = `game-board ${pairs <= 12 ? 'grid-4' : 'grid-6'}`;
    
    // Crear cartas
    memoryGame.game.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.type}`;
        cardElement.dataset.index = index;
        
        cardElement.innerHTML = `
            <div class="front">?</div>
            <div class="back">${card.content}</div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(index));
        board.appendChild(cardElement);
    });
}

// Voltear carta
function flipCard(index) {
    if (!memoryGame.game.canFlip || memoryGame.game.isPaused) return;
    
    const card = memoryGame.game.cards[index];
    const cardElement = document.querySelector(`.card[data-index="${index}"]`);
    
    // No permitir voltear cartas ya emparejadas o ya volteadas
    if (card.matched || memoryGame.game.flippedCards.includes(index)) return;
    
    // Voltear carta
    cardElement.classList.add('flipped');
    memoryGame.game.flippedCards.push(index);
    
    // Verificar si hay dos cartas volteadas
    if (memoryGame.game.flippedCards.length === 2) {
        memoryGame.game.canFlip = false;
        memoryGame.game.moves++;
        updateGameStats();
        
        checkForMatch();
    }
}

// Verificar coincidencia
function checkForMatch() {
    const [index1, index2] = memoryGame.game.flippedCards;
    const card1 = memoryGame.game.cards[index1];
    const card2 = memoryGame.game.cards[index2];
    
    if (card1.pairId === card2.pairId) {
        // Coincidencia encontrada
        card1.matched = true;
        card2.matched = true;
        memoryGame.game.matchedPairs++;
        
        setTimeout(() => {
            document.querySelectorAll(`.card[data-index="${index1}"], .card[data-index="${index2}"]`).forEach(card => {
                card.classList.add('matched');
            });
            
            memoryGame.game.flippedCards = [];
            memoryGame.game.canFlip = true;
            
            // Verificar si el juego ha terminado
            checkGameCompletion();
        }, 500);
    } else {
        // No coincide, voltear de nuevo
        setTimeout(() => {
            document.querySelectorAll(`.card[data-index="${index1}"], .card[data-index="${index2}"]`).forEach(card => {
                card.classList.remove('flipped');
            });
            
            memoryGame.game.flippedCards = [];
            memoryGame.game.canFlip = true;
        }, 1000);
    }
}

// Verificar si el juego ha terminado
function checkGameCompletion() {
    if (memoryGame.game.matchedPairs === memoryGame.config.pairsCount) {
        // Juego completado
        clearInterval(memoryGame.game.timer);
        showResultsScreen();
    }
}

// Pausar juego
function pauseGame() {
    memoryGame.game.isPaused = true;
    clearInterval(memoryGame.game.timer);
    hideAllScreens();
    document.getElementById('pauseScreen').classList.add('active');
}

// Reanudar juego
function resumeGame() {
    memoryGame.game.isPaused = false;
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    startTimer();
}

// Reiniciar juego
function restartGame() {
    clearInterval(memoryGame.game.timer);
    startGameSession();
}

// Iniciar temporizador
function startTimer() {
    clearInterval(memoryGame.game.timer);
    memoryGame.game.timer = setInterval(() => {
        if (!memoryGame.game.isPaused) {
            memoryGame.game.timeElapsed++;
            updateGameStats();
        }
    }, 1000);
}

// Actualizar estadísticas del juego
function updateGameStats() {
    document.getElementById('movesCount').textContent = `Movimientos: ${memoryGame.game.moves}`;
    document.getElementById('pairsCount').textContent = `Parejas: ${memoryGame.game.matchedPairs}/${memoryGame.config.pairsCount}`;
    
    const minutes = Math.floor(memoryGame.game.timeElapsed / 60);
    const seconds = memoryGame.game.timeElapsed % 60;
    document.getElementById('timer').textContent = `Tiempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Mostrar pantalla de resultados
function showResultsScreen() {
    // Calcular precisión y puntuación
    const totalFlips = memoryGame.game.moves * 2;
    const accuracy = totalFlips > 0 ? Math.round((memoryGame.config.pairsCount * 2 / totalFlips) * 100) : 100;
    
    // Calcular puntuación basada en tiempo, movimientos y precisión
    const timeScore = Math.max(0, 300 - memoryGame.game.timeElapsed) * 2;
    const moveScore = Math.max(0, (memoryGame.config.pairsCount * 4 - memoryGame.game.moves)) * 10;
    const accuracyScore = accuracy * 3;
    const totalScore = timeScore + moveScore + accuracyScore;
    
    // Actualizar UI de resultados
    const minutes = Math.floor(memoryGame.game.timeElapsed / 60);
    const seconds = memoryGame.game.timeElapsed % 60;
    
    document.getElementById('finalTime').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalMoves').textContent = memoryGame.game.moves;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('score').textContent = totalScore;
    
    // Mostrar pantalla de resultados
    hideAllScreens();
    document.getElementById('resultsScreen').classList.add('active');
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMemoryGame);
