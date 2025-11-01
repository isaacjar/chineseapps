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
    console.log('Inicializando juego de memoria...');
    
    await loadCharactersForGame();
    setupEventListeners();
    
    // Mostrar pantalla de configuración inmediatamente
    showConfigScreen();
    updateGroupsSelection();
    
    // Establecer valores por defecto
    const defaultPairsBtn = document.querySelector('.pairs-btn[data-pairs="8"]');
    if (defaultPairsBtn) {
        defaultPairsBtn.classList.add('active');
    }
    
    console.log('Juego inicializado, mostrando pantalla de configuración');
}

// Cargar caracteres para el juego
async function loadCharactersForGame() {
    try {
        const response = await fetch('js/chars.json');
        if (response.ok) {
            memoryGame.characters = await response.json();
            console.log('Caracteres cargados:', memoryGame.characters.length);
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
            { ch: '的', pin: 'de', en: 'possessive', es: 'posesivo', lv: '1', gr: '002' }
        ];
    }
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    document.getElementById('backToMain').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('startGame').addEventListener('click', startGame);
    
    document.querySelectorAll('.pairs-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pairs-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            memoryGame.config.pairsCount = parseInt(e.target.dataset.pairs);
            console.log('Parejas seleccionadas:', memoryGame.config.pairsCount);
        });
    });

    document.getElementById('pauseGame').addEventListener('click', pauseGame);
    document.getElementById('resumeGame').addEventListener('click', resumeGame);
    document.getElementById('restartGame').addEventListener('click', restartGame);
    document.getElementById('newGame').addEventListener('click', showConfigScreen);
    document.getElementById('playAgain').addEventListener('click', playAgain);
    document.getElementById('backToConfig').addEventListener('click', showConfigScreen);
}

// Mostrar pantalla de configuración - CORREGIDO
function showConfigScreen() {
    console.log('Mostrando pantalla de configuración...');
    
    // Ocultar todas las pantallas primero
    hideAllScreens();
    
    // Mostrar específicamente la pantalla de configuración
    const configScreen = document.getElementById('configScreen');
    if (configScreen) {
        configScreen.classList.add('active');
        configScreen.style.display = 'block';
        console.log('Pantalla de configuración activada');
    } else {
        console.error('No se encontró la pantalla de configuración');
    }
    
    resetGameState();
    updateGroupsSelection();
}

// Resetear estado del juego
function resetGameState() {
    console.log('Reseteando estado del juego...');
    
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
}

// Actualizar selección de grupos
function updateGroupsSelection() {
    console.log('Actualizando selección de grupos...');
    
    const container = document.getElementById('gameGroupsContainer');
    if (!container) {
        console.error('No se encontró el contenedor de grupos');
        return;
    }
    
    container.innerHTML = '';

    const groups = [...new Set(memoryGame.characters.map(char => char.gr))].sort();
    console.log('Grupos disponibles:', groups);
    
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
            console.log('Grupos seleccionados:', [...memoryGame.config.selectedGroups]);
        });
        
        container.appendChild(groupBtn);
    });
}

// Ocultar todas las pantallas
function hideAllScreens() {
    console.log('Ocultando todas las pantallas...');
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
}

// Mostrar una pantalla específica
function showScreen(screenId) {
    console.log('Mostrando pantalla:', screenId);
    
    hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        if (screen.classList.contains('overlay')) {
            screen.style.display = 'flex';
        } else {
            screen.style.display = 'block';
        }
    }
}

// Iniciar juego
function startGame() {
    console.log('Iniciando juego...');
    
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

    console.log('Configuración:', {
        groups: [...memoryGame.config.selectedGroups],
        pairs: memoryGame.config.pairsCount,
        mode: memoryGame.config.matchMode,
        difficulty: memoryGame.config.difficulty
    });

    if (!prepareGameCards()) {
        return;
    }
    
    showScreen('gameScreen');
    startGameSession();
}

// Preparar cartas del juego
function prepareGameCards() {
    console.log('Preparando cartas del juego...');
    
    memoryGame.game.cards = [];
    
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

    const selectedChars = [];
    const shuffled = [...availableChars].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < memoryGame.config.pairsCount; i++) {
        if (shuffled[i]) {
            selectedChars.push(shuffled[i]);
        }
    }

    // Crear pares de cartas
    selectedChars.forEach((char, index) => {
        const pairId = `pair-${index}-${char.ch}`;
        
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
    
    console.log('Cartas preparadas correctamente. Total:', memoryGame.game.cards.length);
    
    return true;
}

// Iniciar sesión de juego - MODIFICADO: Sin vista previa
function startGameSession() {
    console.log('Iniciando sesión de juego...');
    
    // Verificar que no haya cartas emparejadas
    memoryGame.game.cards.forEach(card => {
        if (card.matched) {
            console.error('Carta emparejada al inicio:', card);
            card.matched = false;
        }
    });

    memoryGame.game.matchedPairs = 0;
    memoryGame.game.moves = 0;
    memoryGame.game.timeElapsed = 0;
    memoryGame.game.flippedCards = [];
    memoryGame.game.isPaused = false;
    memoryGame.game.canFlip = true; // Permitir voltear inmediatamente
    memoryGame.game.gameStarted = true;

    updateGameStats();
    renderGameBoard();
    startTimer(); // Quitado showCardsTemporarily()
    
    console.log('Sesión de juego iniciada correctamente');
}

// Mostrar cartas temporalmente al inicio
/*function showCardsTemporarily() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });

    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flipped');
        });
        memoryGame.game.canFlip = true;
        console.log('Juego listo para jugar');
    }, memoryGame.config.viewTime * 1000);
}*/

// Renderizar tablero de juego
function renderGameBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    const pairs = memoryGame.config.pairsCount;
    const totalCards = pairs * 2;
    
    // Calcular grid dinámicamente según el número de cartas
    let gridColumns = 4;
    if (totalCards <= 16) {
        gridColumns = 4;
    } else if (totalCards <= 24) {
        gridColumns = 6;
    } else if (totalCards <= 36) {
        gridColumns = 8;
    } else {
        gridColumns = 10;
    }
    
    board.className = 'game-board';
    board.style.gridTemplateColumns = `repeat(${gridColumns}, 1fr)`;
    
    console.log(`Renderizando ${totalCards} cartas en grid ${gridColumns}x${Math.ceil(totalCards/gridColumns)}`);
    
    memoryGame.game.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.type} ${card.matched ? 'matched' : ''}`;
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
    
    console.log('Verificando:', card1.content, 'vs', card2.content);
    console.log('PairIds:', card1.pairId, 'vs', card2.pairId);
    
    if (card1.pairId === card2.pairId) {
        console.log('¡Coincidencia!');
        
        card1.matched = true;
        card2.matched = true;
        memoryGame.game.matchedPairs++;
        
        // Actualizar clases para cambiar el color
        document.querySelectorAll(`.card[data-index="${index1}"], .card[data-index="${index2}"]`).forEach(card => {
            card.classList.add('matched', 'success');
            card.dataset.matched = 'true';
        });
        
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

// Verificar si el juego ha terminado
function checkGameCompletion() {
    console.log('Parejas encontradas:', memoryGame.game.matchedPairs, 'de', memoryGame.config.pairsCount);
    
    if (memoryGame.game.matchedPairs === memoryGame.config.pairsCount) {
        console.log('¡Juego completado! Mostrando resultados...');
        clearInterval(memoryGame.game.timer);
        
        setTimeout(() => {
            showResultsScreen();
        }, 1000);
    }
}

// Jugar otra vez
function playAgain() {
    showScreen('gameScreen');
    startGameSession();
}

// Pausar juego
function pauseGame() {
    memoryGame.game.isPaused = true;
    clearInterval(memoryGame.game.timer);
    showScreen('pauseScreen');
}

// Reanudar juego
function resumeGame() {
    memoryGame.game.isPaused = false;
    showScreen('gameScreen');
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
    
    showScreen('resultsScreen');
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMemoryGame);
