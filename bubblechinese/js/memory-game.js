// Estado del juego de memoria
const memoryGame = {
    config: {
        selectedGroups: new Set(['001']),
        pairsCount: 8,
        matchMode: 'pinyin',
        difficulty: 'easy',
        viewTime: 8
    },
    game: {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: null,
        timeElapsed: 0,
        isPaused: false,
        canFlip: false,
        gameStarted: false
    },
    characters: []
};

// Inicializar el juego
async function initMemoryGame() {
    await loadCharactersForGame();
    setupEventListeners();
    showConfigScreen();
    updateGroupsSelection();
    
    document.querySelector('.pairs-btn').classList.add('active');
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
        memoryGame.characters = [
            { ch: '你', pin: 'nǐ', en: 'you', es: 'tú', lv: '1', gr: '001' },
            { ch: '好', pin: 'hǎo', en: 'good', es: 'bueno', lv: '1', gr: '001' },
            { ch: '我', pin: 'wǒ', en: 'I/me', es: 'yo/mí', lv: '1', gr: '001' },
            { ch: '是', pin: 'shì', en: 'to be', es: 'ser', lv: '1', gr: '002' },
            { ch: '的', pin: 'de', en: 'possessive', es: 'posesivo', lv: '1', gr: '002' },
            { ch: '了', pin: 'le', en: 'completed action', es: 'acción terminada', lv: '1', gr: '002' },
            { ch: '不', pin: 'bù', en: 'not; no', es: 'no', lv: '1', gr: '002' },
            { ch: '他', pin: 'tā', en: 'he, him', es: 'él', lv: '1', gr: '003' }
        ];
    }
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('backToMain').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('startGame').addEventListener('click', startGame);
    
    document.querySelectorAll('.pairs-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pairs-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            memoryGame.config.pairsCount = parseInt(e.target.dataset.pairs);
        });
    });

    document.getElementById('pauseGame').addEventListener('click', pauseGame);
    document.getElementById('resumeGame').addEventListener('click', resumeGame);
    document.getElementById('restartGame').addEventListener('click', restartGame);
    document.getElementById('newGame').addEventListener('click', showConfigScreen);
    document.getElementById('playAgain').addEventListener('click', playAgain);
    document.getElementById('backToConfig').addEventListener('click', showConfigScreen);
}

// Mostrar pantalla de configuración
function showConfigScreen() {
    hideAllScreens();
    document.getElementById('configScreen').classList.add('active');
    updateGroupsSelection();
    resetGameState();
}

// Resetear estado del juego - CORREGIDO
function resetGameState() {
    clearInterval(memoryGame.game.timer);
    memoryGame.game = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: null,
        timeElapsed: 0,
        isPaused: false,
        canFlip: false,
        gameStarted: false
    };
    console.log('Estado del juego reseteado');
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

    const matchMode = document.querySelector('input[name="matchMode"]:checked').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    memoryGame.config.matchMode = matchMode;
    memoryGame.config.difficulty = difficulty;
    
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

    if (!prepareGameCards()) {
        return;
    }
    
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    
    startGameSession();
}

// Preparar cartas del juego - COMPLETAMENTE REESCRITA
function prepareGameCards() {
    // Resetear cartas primero
    memoryGame.game.cards = [];
    
    // Obtener caracteres disponibles
    const availableChars = memoryGame.characters.filter(char => 
        memoryGame.config.selectedGroups.has(char.gr)
    );

    if (availableChars.length === 0) {
        alert('No hay caracteres disponibles en los grupos seleccionados.');
        return false;
    }

    if (availableChars.length < memoryGame.config.pairsCount) {
        alert(`Solo hay ${availableChars.length} caracteres disponibles. Selecciona más grupos o reduce el número de parejas.`);
        return false;
    }

    // Seleccionar caracteres aleatorios
    const selectedChars = [];
    const shuffled = [...availableChars].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < memoryGame.config.pairsCount; i++) {
        if (shuffled[i]) {
            selectedChars.push(shuffled[i]);
        }
    }

    console.log('Preparando juego con caracteres:', selectedChars.map(c => c.ch));

    // CREAR PARES DE CARTAS - MÉTODO SIMPLIFICADO Y CORREGIDO
    selectedChars.forEach((char, index) => {
        const pairId = `pair-${index}-${char.ch}`; // ID único para el par
        
        // Carta 1: Carácter chino
        memoryGame.game.cards.push({
            id: `ch-${pairId}`,
            type: 'chinese',
            content: char.ch,
            pairId: pairId,
            matched: false
        });

        // Carta 2: Traducción
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
            id: `trans-${pairId}`,
            type: translationType,
            content: translationContent,
            pairId: pairId,
            matched: false
        });
    });

    // Mezclar cartas
    memoryGame.game.cards = memoryGame.game.cards.sort(() => Math.random() - 0.5);
    
    console.log('Cartas creadas:', memoryGame.game.cards.length);
    console.log('Estado inicial de las cartas:', memoryGame.game.cards.map(c => ({
        content: c.content,
        pairId: c.pairId,
        matched: c.matched
    })));
    
    return true;
}

// Iniciar sesión de juego
function startGameSession() {
    // VERIFICACIÓN CRÍTICA: Asegurar que ninguna carta esté emparejada
    memoryGame.game.cards.forEach(card => {
        if (card.matched) {
            console.error('ERROR: Carta ya emparejada al inicio:', card);
            card.matched = false; // Forzar a no emparejada
        }
    });

    memoryGame.game.matchedPairs = 0;
    memoryGame.game.moves = 0;
    memoryGame.game.timeElapsed = 0;
    memoryGame.game.flippedCards = [];
    memoryGame.game.isPaused = false;
    memoryGame.game.canFlip = false;
    memoryGame.game.gameStarted = true;

    updateGameStats();
    renderGameBoard();
    showCardsTemporarily();
    startTimer();
    
    console.log('Juego iniciado. Parejas emparejadas:', memoryGame.game.matchedPairs);
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
        console.log('Cartas ocultadas. Juego listo para jugar.');
    }, memoryGame.config.viewTime * 1000);
}

// Renderizar tablero de juego
function renderGameBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    const pairs = memoryGame.config.pairsCount;
    const totalCards = pairs * 2;
    board.className = `game-board ${totalCards <= 24 ? 'grid-4' : 'grid-6'}`;
    
    console.log('Renderizando', totalCards, 'cartas no emparejadas');
    
    memoryGame.game.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.type}`;
        cardElement.dataset.index = index;
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.pairId = card.pairId;
        cardElement.dataset.matched = card.matched;
        
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
    if (!memoryGame.game.canFlip || memoryGame.game.isPaused) {
        return;
    }
    
    const card = memoryGame.game.cards[index];
    
    if (card.matched || memoryGame.game.flippedCards.includes(index)) {
        return;
    }
    
    if (memoryGame.game.flippedCards.length >= 2) {
        return;
    }
    
    const cardElement = document.querySelector(`.card[data-index="${index}"]`);
    cardElement.classList.add('flipped');
    memoryGame.game.flippedCards.push(index);
    
    console.log('Carta volteada:', card.content, 'Index:', index);
    
    if (memoryGame.game.flippedCards.length === 2) {
        memoryGame.game.canFlip = false;
        memoryGame.game.moves++;
        updateGameStats();
        
        setTimeout(() => {
            checkForMatch();
        }, 300);
    }
}

// Verificar coincidencia
function checkForMatch() {
    const [index1, index2] = memoryGame.game.flippedCards;
    const card1 = memoryGame.game.cards[index1];
    const card2 = memoryGame.game.cards[index2];
    
    console.log('Verificando coincidencia:');
    console.log('Carta 1:', card1.content, 'PairId:', card1.pairId);
    console.log('Carta 2:', card2.content, 'PairId:', card2.pairId);
    console.log('¿Coinciden?', card1.pairId === card2.pairId);
    
    if (card1.pairId === card2.pairId) {
        console.log('¡COINCIDENCIA ENCONTRADA!');
        
        card1.matched = true;
        card2.matched = true;
        memoryGame.game.matchedPairs++;
        
        document.querySelectorAll(`.card[data-index="${index1}"], .card[data-index="${index2}"]`).forEach(card => {
            card.classList.add('matched');
            card.dataset.matched = 'true';
        });
        
        console.log('Parejas emparejadas:', memoryGame.game.matchedPairs, 'de', memoryGame.config.pairsCount);
        
        memoryGame.game.flippedCards = [];
        memoryGame.game.canFlip = true;
        
        checkGameCompletion();
    } else {
        console.log('No coincide');
        
        setTimeout(() => {
            document.querySelectorAll(`.card[data-index="${index1}"], .card[data-index="${index2}"]`).forEach(card => {
                card.classList.remove('flipped');
            });
            
            memoryGame.game.flippedCards = [];
            memoryGame.game.canFlip = true;
        }, 1000);
    }
}

// Verificar si el juego ha terminado - CORREGIDO
function checkGameCompletion() {
    console.log('Verificando fin del juego. Parejas:', memoryGame.game.matchedPairs, 'Total:', memoryGame.config.pairsCount);
    
    // VERIFICACIÓN MÁS ESTRICTA
    const allMatched = memoryGame.game.cards.every(card => card.matched);
    const pairsMatched = memoryGame.game.matchedPairs === memoryGame.config.pairsCount;
    
    console.log('Todas las cartas emparejadas:', allMatched);
    console.log('Parejas completadas:', pairsMatched);
    
    if (pairsMatched && allMatched) {
        console.log('¡JUEGO REALMENTE COMPLETADO!');
        clearInterval(memoryGame.game.timer);
        
        setTimeout(() => {
            showResultsScreen();
        }, 1000);
    } else {
        console.log('Juego aún en progreso...');
    }
}

// Jugar otra vez
function playAgain() {
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    startGameSession();
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
        if (!memoryGame.game.isPaused && memoryGame.game.gameStarted) {
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
    console.log('Mostrando resultados...');
    
    const totalFlips = memoryGame.game.moves * 2;
    const accuracy = totalFlips > 0 ? Math.round((memoryGame.config.pairsCount * 2 / totalFlips) * 100) : 100;
    const timeScore = Math.max(0, 300 - memoryGame.game.timeElapsed) * 2;
    const moveScore = Math.max(0, (memoryGame.config.pairsCount * 4 - memoryGame.game.moves)) * 10;
    const accuracyScore = accuracy * 3;
    const totalScore = timeScore + moveScore + accuracyScore;
    
    const minutes = Math.floor(memoryGame.game.timeElapsed / 60);
    const seconds = memoryGame.game.timeElapsed % 60;
    
    document.getElementById('finalTime').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalMoves').textContent = memoryGame.game.moves;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('score').textContent = totalScore;
    
    hideAllScreens();
    document.getElementById('resultsScreen').classList.add('active');
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMemoryGame);
