// game5.js - Memory Game
class Game5 {
    constructor(settings, stats, ui) {
        this.settings = settings;
        this.stats = stats;
        this.ui = ui;
        this.currentGame = 'game5';
        this.vocabulary = [];
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.selectedCards = [];
        this.canSelect = true;
        this.timer = null;
        this.timeElapsed = 0;
        this.gameStarted = false;
        this.resizeTimeout = null;
        
        // Guardar referencia a elementos base que ocultaremos
        this.baseGameElements = null;
        
        // URL base para las imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Cache para imágenes cargadas
        this.imageCache = new Map();
        
        // Configuración del juego
        this.gridSize = 12; // Número de tarjetas por defecto (6 pares)
        this.gridOptions = [8, 12, 16, 24, 32]; // Opciones de tamaño de grid
        
        // Bind de métodos
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    async startGame() {
        // Cargar listados de imágenes
        await this.loadPictureLists();
        
        // Mostrar popup de configuración inicial
        this.showInitialSetupPopup();
    }

    async loadPictureLists() {
        try {
            const response = await fetch(this.picturesBaseUrl + 'index.js');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scriptContent = await response.text();
            const match = scriptContent.match(/const vocpiclists\s*=\s*(\[.*?\]);/s);
            
            if (match && match[1]) {
                try {
                    this.availablePictureLists = eval(`(${match[1]})`);
                } catch (e) {
                    console.error('Error parseando listados de imágenes:', e);
                    this.useFallbackPictureLists();
                }
            } else {
                this.useFallbackPictureLists();
            }
        } catch (error) {
            console.error('Error cargando listados de imágenes:', error);
            this.useFallbackPictureLists();
        }
    }

    useFallbackPictureLists() {
        this.availablePictureLists = [
            { filename: "hsk1_basic1_40", title: "HSK 1 A (40 words)", level: "H1", misc: "Isaac" },
            { filename: "hsk1_basic_60", title: "HSK 1 Full (60 words)", level: "H1", misc: "Isaac" },
            { filename: "hsk2_basic_150", title: "HSK 2 Full (150 words)", level: "H2", misc: "Isaac" },
            { filename: "hsk3_full_360", title: "HSK 3 Full (360 words)", level: "H3", misc: "Isaac" }
        ];
    }

    showInitialSetupPopup() {
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay game5-popup-overlay';
        
        const content = document.createElement('div');
        content.className = 'popup-content game5-popup-content';
        
        const title = document.createElement('h2');
        title.textContent = '🎮 Memory Game - Setup';
        title.className = 'game5-popup-title';

        // Selector de listado
        const listSection = document.createElement('div');
        listSection.className = 'game5-list-section';
        
        const listLabel = document.createElement('h3');
        listLabel.textContent = '1. Select Vocabulary List';
        listLabel.className = 'game5-section-label';
        
        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container game5-lists-container';

        this.availablePictureLists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'vocab-list-btn game5-vocab-list-btn';
            button.textContent = `${list.title} (${list.level})`;
            button.dataset.filename = list.filename;

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.game5-vocab-list-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Marcar el seleccionado
                button.classList.add('selected');
                this.selectedList = list;
            });

            listsContainer.appendChild(button);
        });

        listSection.appendChild(listLabel);
        listSection.appendChild(listsContainer);

        // Selector de tamaño de grid
        const gridSection = document.createElement('div');
        gridSection.className = 'game5-grid-section';
        
        const gridLabel = document.createElement('h3');
        gridLabel.textContent = '2. Select Difficulty (Number of Cards)';
        gridLabel.className = 'game5-section-label';
        
        const gridOptionsContainer = document.createElement('div');
        gridOptionsContainer.className = 'grid-options game5-grid-options';

        this.gridOptions.forEach(size => {
            const button = document.createElement('button');
            button.className = 'grid-option-btn game5-grid-option-btn';
            button.textContent = `${size} cards (${size/2} pairs)`;
            button.dataset.size = size;

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.game5-grid-option-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Marcar el seleccionado
                button.classList.add('selected');
                this.gridSize = size;
            });

            gridOptionsContainer.appendChild(button);
        });

        gridSection.appendChild(gridLabel);
        gridSection.appendChild(gridOptionsContainer);

        // Botones de acción
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'game5-buttons-container';

        const startButton = document.createElement('button');
        startButton.textContent = '🚀 Start Game';
        startButton.className = 'btn game5-start-btn';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'btn game5-cancel-btn';

        startButton.addEventListener('click', async () => {
            if (!this.selectedList) {
                this.ui.showToast('Please select a vocabulary list', 'error');
                return;
            }

            this.ui.showToast(`Loading "${this.selectedList.title}"...`, 'info');
            const success = await this.loadPictureList(this.selectedList.filename);
            
            if (success) {
                document.body.removeChild(popup);
                this.startGameSession();
            } else {
                this.ui.showToast(`Error loading "${this.selectedList.title}"`, 'error');
            }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(popup);
            this.restoreMenuState(); // Añade esta línea
            this.ui.showScreen('menu-screen');
        });
        buttonsContainer.appendChild(startButton);
        buttonsContainer.appendChild(cancelButton);

        // Seleccionar primer listado y tamaño por defecto
        if (this.availablePictureLists.length > 0) {
            this.selectedList = this.availablePictureLists[0];
            const firstListBtn = listsContainer.querySelector('.game5-vocab-list-btn');
            if (firstListBtn) firstListBtn.classList.add('selected');
            
            // Seleccionar tamaño medio por defecto
            this.gridSize = 12;
            const mediumGridBtn = gridOptionsContainer.querySelector(`[data-size="12"]`);
            if (mediumGridBtn) mediumGridBtn.classList.add('selected');
        }

        content.appendChild(title);
        content.appendChild(listSection);
        content.appendChild(gridSection);
        content.appendChild(buttonsContainer);
        popup.appendChild(content);
        document.body.appendChild(popup);
    }

    async loadPictureList(filename) {
        try {
            const response = await fetch(`${this.picturesBaseUrl}${filename}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Empty or invalid list');
            }
            
            // Filtrar palabras con caracteres chinos
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No Chinese characters in this list');
            }
            
            // Verificar que tenemos suficientes palabras para el tamaño seleccionado
            const requiredWords = Math.min(this.gridSize / 2, this.vocabulary.length);
            
            if (requiredWords < this.gridSize / 2) {
                this.ui.showToast(`Warning: List has only ${this.vocabulary.length} words, using ${requiredWords * 2} cards`, 'info');
                this.gridSize = requiredWords * 2;
            }
            
            console.log(`List "${filename}" loaded: ${this.vocabulary.length} words with images`);
            
            // Pre-cargar algunas imágenes
            await this.preloadImages();
            
            return true;
            
        } catch (error) {
            console.error('Error loading image list:', error);
            
            // Usar datos de ejemplo
            this.vocabulary = [
                { ch: "猫", pin: "māo", en: "cat", es: "gato" },
                { ch: "狗", pin: "gǒu", en: "dog", es: "perro" },
                { ch: "苹果", pin: "píngguǒ", en: "apple", es: "manzana" },
                { ch: "书", pin: "shū", en: "book", es: "libro" },
                { ch: "水", pin: "shuǐ", en: "water", es: "agua" },
                { ch: "鱼", pin: "yú", en: "fish", es: "pez" },
                { ch: "鸟", pin: "niǎo", en: "bird", es: "pájaro" },
                { ch: "花", pin: "huā", en: "flower", es: "flor" }
            ];
            
            this.ui.showToast(`Could not load "${filename}". Using example data.`, 'error');
            return true;
        }
    }

    async preloadImages() {
        const wordsToPreload = this.vocabulary.slice(0, Math.min(10, this.vocabulary.length));
        
        const preloadPromises = wordsToPreload.map(word => this.getImageUrl(word));
        await Promise.allSettled(preloadPromises);
    }

    async getImageUrl(word) {
        const cacheKey = word.ch;
        
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }
        
        let imageUrl;
        
        if (word.pic) {
            imageUrl = `${this.picFolderUrl}${word.pic}`;
        } else {
            imageUrl = `${this.picFolderUrl}${word.ch}.png`;
        }
        
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                this.imageCache.set(cacheKey, imageUrl);
                return imageUrl;
            }
        } catch {}
        
        const placeholderUrl = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(word.ch.substring(0, 2))}`;
        this.imageCache.set(cacheKey, placeholderUrl);
        return placeholderUrl;
    }

    // ========== MÉTODOS PRINCIPALES CORREGIDOS ==========

    hideBaseGameElements() {
        console.log('Game5: CSS maneja la visibilidad de elementos base');
        //console.log('Game5: Ocultando elementos base de otros juegos');
        
        // También ocultar otros elementos específicos
        /*const elementsToHide = [
            '#question-container',
            '#options-container',
            '.timer-bar',
            '.question-text'
        ];*/
        
        /*elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
            }
        });*/
        
        // Guardar referencias para restaurar después
        /*this.hiddenElements = {
            gameContainer: gameContainer,
            questionContainer: document.getElementById('question-container'),
            optionsContainer: document.getElementById('options-container'),
            timerBar: document.querySelector('.timer-bar')
        };*/
    }
    
   restoreBaseGameElements() {
        console.log('Game5: CSS restaura elementos base automáticamente');
        /*console.log('Game5: Restaurando elementos base');
        
        // Solo asegurarse de que el game-container original sea visible
        // (esto es redundante con el CSS, pero por seguridad)
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            // Resetear todos los estilos que podríamos haber cambiado
            gameContainer.style.cssText = '';
        }
        
        // También restablecer otros elementos específicos si los hubiéramos modificado
        const questionContainer = document.getElementById('question-container');
        const optionsContainer = document.getElementById('options-container');
        
        if (questionContainer) questionContainer.style.cssText = '';
        if (optionsContainer) optionsContainer.style.cssText = '';*/
    }

    ensureCriticalElements() {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;
        
        // Elementos que Game y Game2 NECESITAN
        const criticalElements = [
            { id: 'question-text', tag: 'div', className: 'question-text' },
            { id: 'options-container', tag: 'div', className: 'options-container' },
            { id: 'timer-progress', tag: 'div', className: 'timer-progress' }
        ];
        
        criticalElements.forEach(elem => {
            if (!document.getElementById(elem.id)) {
                console.log(`Game5: Creando elemento crítico: ${elem.id}`);
                const element = document.createElement(elem.tag);
                element.id = elem.id;
                element.className = elem.className;
                gameScreen.appendChild(element);
            }
        });
    }

    startGameSession() {
        // Resetear estado del juego
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.totalPairs = this.gridSize / 2;
        this.selectedCards = [];
        this.canSelect = true;
        this.timeElapsed = 0;
        this.gameStarted = false;
        
        // Mostrar pantalla de juego
        this.ui.showScreen('game-screen');
        
        // Marcar que Game5 está activo
        document.getElementById('game-screen').classList.add('game5-active');
        
        // NO usar ui.showGameStats() - Game5 maneja sus propias estadísticas
        // this.ui.showGameStats(); // ← ¡ELIMINA ESTA LÍNEA!
        
        // En su lugar, configurar estadísticas específicas de Game5
        this.setupGameStats();
        
        // Inicializar los valores en el header
        this.updateStats();
        
        // Crear tablero
        this.createBoard();
        
        // Iniciar timer
        this.startTimer();
    }
        
    setupGameStats() {
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (!gameStats) return;
        
        // 1. OCULTAR el botón de configuración ⚙️
        if (settingsBtn) {
            settingsBtn.classList.add('hidden');
            settingsBtn.style.display = 'none';
        }
        
        // 2. Eliminar estadísticas anteriores de Game5 si existen
        const existingGame5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
        existingGame5Stats.forEach(stat => stat.remove());
        
        // 3. Ocultar elementos originales COMPLETAMENTE
        const originalIds = ['question-progress', 'score', 'streak', 'lives'];
        originalIds.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) {
                elem.style.display = 'none';
                elem.style.visibility = 'hidden';
                elem.style.opacity = '0';
            }
        });
        
        // 4. Botón restart
        const restartButton = document.createElement('button');
        restartButton.id = 'game5-restart-btn';
        restartButton.className = 'game5-stat game5-restart-btn';
        restartButton.innerHTML = '🔄';
        restartButton.title = 'Restart Game';
        restartButton.addEventListener('click', () => {
            this.cleanup();
            this.startGameSession();
        });
        
        gameStats.appendChild(restartButton);
            
        // 5. Crear nuevos elementos de estadísticas para Game5
        const stats = [
            { id: 'game5-time', icon: '⏱️', value: '0s' },
            { id: 'game5-moves', icon: '👣', value: '0' },
            { id: 'game5-pairs', icon: '✨', value: `0/${this.totalPairs}` },
            { id: 'game5-score', icon: '🏅', value: '0' }
        ];
        
        stats.forEach(stat => {
            const statElement = document.createElement('span');
            statElement.id = stat.id;
            statElement.className = 'game5-stat';
            statElement.textContent = `${stat.icon} ${stat.value}`;
            
            // Asegurar que sean visibles
            statElement.style.display = 'inline-block';
            statElement.style.visibility = 'visible';
            statElement.style.opacity = '1';
            
            gameStats.appendChild(statElement);
        });
        
        // 6. Mostrar el contenedor de estadísticas
        gameStats.classList.remove('hidden');
        gameStats.style.display = 'flex';
        gameStats.style.visibility = 'visible';
        gameStats.style.opacity = '1';
    }
    
   // Añade este método para restaurar el estado del menú
    restoreMenuState() {
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (!gameStats) return;
        
        // Eliminar solo las estadísticas de Game5
        const game5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
        game5Stats.forEach(stat => stat.remove());
        
        // Mostrar los elementos originales
        const originalIds = ['question-progress', 'score', 'streak', 'lives'];
        originalIds.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.style.display = 'inline';
        });
        
        // RESTAURAR el botón de configuración
        if (settingsBtn) {
            settingsBtn.classList.remove('hidden');
            settingsBtn.style.display = 'inline-block';
        }
        
        // Ocultar el contenedor de estadísticas (mostrar solo el botón ⚙️)
        gameStats.classList.add('hidden');
    }
        
    createBoard() {
        const gameScreen = document.getElementById('game-screen');
        
        // 1. Limpiar contenedores anteriores de Game5
        const existingContainers = document.querySelectorAll(
            '.memory-game-container, .game5-container, .game5-grid-wrapper'
        );
        existingContainers.forEach(container => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });
        
        // 2. Crear NUEVO contenedor para Game5
        const gameContainer = document.createElement('div');
        gameContainer.className = 'memory-game-container game5-container';
        
       // 3. Crear grid wrapper CON SCROLL SUAVE
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'game5-grid-wrapper';
        gridWrapper.style.width = '100%';
        gridWrapper.style.height = 'auto';
        gridWrapper.style.maxHeight = 'calc(100vh - 140px)'; // Más espacio del header
        gridWrapper.style.overflowY = 'auto';
        gridWrapper.style.overflowX = 'hidden';
        gridWrapper.style.display = 'flex';
        gridWrapper.style.flexDirection = 'column';
        gridWrapper.style.justifyContent = 'flex-start'; // Alinear al inicio
        gridWrapper.style.alignItems = 'center';
        gridWrapper.style.padding = '0.5rem';
        gridWrapper.style.boxSizing = 'border-box';
        gridWrapper.style.scrollBehavior = 'smooth'; // Scroll suave
        
        // 4. Crear grid de cartas
        const gridContainer = document.createElement('div');
        gridContainer.className = 'memory-grid game5-grid';
        gridContainer.id = 'memory-grid';
        gridContainer.style.flex = '1';
        gridContainer.style.minHeight = '0';
        gridContainer.style.maxHeight = '100%';
        gridContainer.style.width = '100%';
        
        // 5. CREAR Y AÑADIR LAS CARTAS AL GRID
        const cards = this.generateCards();
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            gridContainer.appendChild(cardElement);
        });
        
        // 6. ENSAMBLAR TODO
        gridWrapper.appendChild(gridContainer);
        gameContainer.appendChild(gridWrapper);
        gameScreen.appendChild(gameContainer);
        
        // 7. Configurar grid después de añadirlo al DOM
        setTimeout(() => {
            if (gridContainer) {
                this.setupGridLayout(gridContainer);
            }
        }, 100);
        
        // 8. Redimensionar al cambiar tamaño
        if (gridContainer) {
            window.addEventListener('resize', () => this.handleResize(gridContainer));
        }
    }

    generateCards() {
        const cards = [];
        
        // Seleccionar palabras aleatorias para este juego
        const selectedWords = this.getRandomWords(this.totalPairs);
        
        // Crear pares: una carta con imagen y una con texto para cada palabra
        selectedWords.forEach((word, index) => {
            // Carta con imagen
            cards.push({
                id: index * 2,
                word: word,
                type: 'image'
            });
            
            // Carta con texto
            cards.push({
                id: index * 2 + 1,
                word: word,
                type: 'text'
            });
        });
        
        // Mezclar las cartas
        return this.shuffleArray(cards);
    }
    
    getRandomWords(count) {
        // Crear copia del vocabulario
        const shuffled = [...this.vocabulary];
        
        // Mezclar
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Tomar las primeras 'count' palabras
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    
    setupGridLayout(gridContainer) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isLandscape = viewportWidth > viewportHeight;
        const isMobile = viewportWidth < 768;
        
        console.log(`Game5 - Viewport: ${viewportWidth}x${viewportHeight}, Cards: ${this.gridSize}`);
        
        // Calcular espacio disponible para el grid
        // Restar espacio para header y márgenes
        const headerHeight = 80; // Aumentar un poco para mayor seguridad
        const availableHeight = viewportHeight - headerHeight - 60; // Más margen
        const availableWidth = viewportWidth - 40;
        
        // Calcular número óptimo de columnas y filas
        let columns, rows;
        
        // Para Game5, usar lógica más simple basada en número de cartas
        if (this.gridSize <= 12) {
            // Hasta 12 cartas (6 pares): 3x4 o 4x3
            columns = isLandscape ? 4 : 3;
        } else if (this.gridSize <= 16) {
            // 16 cartas (8 pares): 4x4
            columns = 4;
        } else if (this.gridSize <= 20) {
            // 20 cartas (10 pares): 4x5 o 5x4
            columns = isLandscape ? 5 : 4;
        } else if (this.gridSize <= 24) {
            // 24 cartas (12 pares): 4x6 o 6x4
            columns = isLandscape ? 6 : 4;
        } else {
            // 32 cartas (16 pares): 4x8 o 8x4
            columns = isLandscape ? 8 : 4;
        }
        
        // Limitar columnas según ancho disponible
        const minCardWidth = 70; // Ancho mínimo de carta
        const maxColumnsByWidth = Math.floor(availableWidth / (minCardWidth + 10));
        columns = Math.min(columns, maxColumnsByWidth);
        
        // Asegurar mínimo de 2 columnas
        columns = Math.max(2, columns);
        
        // Calcular filas necesarias
        rows = Math.ceil(this.gridSize / columns);
        
        // Si hay demasiadas filas, aumentar columnas
        const maxVisibleRows = Math.floor(availableHeight / (minCardWidth * 1.2 + 10));
        if (rows > maxVisibleRows) {
            columns = Math.ceil(this.gridSize / maxVisibleRows);
            rows = Math.ceil(this.gridSize / columns);
        }
        
        // Limitar columnas nuevamente
        columns = Math.min(columns, maxColumnsByWidth);
        columns = Math.max(2, columns);
        
        console.log(`Game5 - Grid: ${columns} columns x ${rows} rows`);
        
        // Calcular tamaño de carta basado en espacio REAL disponible
        const horizontalGap = 8; // Gap más pequeño
        const verticalGap = 8;
        
        const cardWidth = Math.max(
            minCardWidth,
            Math.min(180, Math.floor((availableWidth - (columns - 1) * horizontalGap) / columns))
        );
        
        const cardHeight = cardWidth * 1.2;
        
        // Verificar si cabe verticalmente
        const neededHeight = (cardHeight * rows) + ((rows - 1) * verticalGap);
        if (neededHeight > availableHeight) {
            // Reducir tamaño de cartas para que quepan
            const maxCardHeight = Math.floor((availableHeight - ((rows - 1) * verticalGap)) / rows);
            const adjustedCardWidth = maxCardHeight / 1.2;
            
            if (adjustedCardWidth >= minCardWidth) {
                // Usar tamaño ajustado
                const finalCardWidth = Math.min(cardWidth, adjustedCardWidth);
                const finalCardHeight = finalCardWidth * 1.2;
                
                console.log(`Game5 - Ajustado: ${finalCardWidth}px x ${finalCardHeight}px`);
                this.applyCardSizeConstraints(finalCardWidth, finalCardHeight);
            } else {
                // No cabe, reducir filas aumentando columnas
                columns = Math.min(columns + 1, maxColumnsByWidth);
                rows = Math.ceil(this.gridSize / columns);
                console.log(`Game5 - Recalculado: ${columns} columns x ${rows} rows`);
                
                // Recalcular tamaño con nuevas dimensiones
                const newCardWidth = Math.max(
                    minCardWidth,
                    Math.min(180, Math.floor((availableWidth - (columns - 1) * horizontalGap) / columns))
                );
                const newCardHeight = newCardWidth * 1.2;
                this.applyCardSizeConstraints(newCardWidth, newCardHeight);
            }
        } else {
            console.log(`Game5 - Card size: ${cardWidth}px x ${cardHeight}px`);
            this.applyCardSizeConstraints(cardWidth, cardHeight);
        }
        
        // Configurar grid con gaps más pequeños
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, auto)`; // Usar auto, no 1fr
        gridContainer.style.gap = `${verticalGap}px ${horizontalGap}px`;
        gridContainer.style.padding = '0.5rem';
        gridContainer.style.boxSizing = 'border-box';
        
        // Ajustes para contenedor
        gridContainer.style.width = '100%';
        gridContainer.style.height = 'auto';
        gridContainer.style.minHeight = '0';
        gridContainer.style.maxHeight = `${availableHeight}px`;
        gridContainer.style.overflow = 'visible'; // Cambiar a visible
        gridContainer.style.placeItems = 'center';
        gridContainer.style.alignContent = 'start'; // Alinear al inicio
    }
    
    applyCardSizeConstraints(cardWidth, cardHeight) {
        const style = document.createElement('style');
        style.id = 'memory-card-styles';
        
        const oldStyle = document.getElementById('memory-card-styles');
        if (oldStyle) oldStyle.remove();
        
        // Usar los tamaños calculados
        const maxCardWidth = cardWidth || 100;
        const maxCardHeight = cardHeight || 120;
        
        // Calcular tamaños de fuente proporcionales
        const chineseFontSize = Math.min(2.5, maxCardWidth / 25);
        const pinyinFontSize = Math.min(1, maxCardWidth / 50);
        
        style.textContent = `
            .memory-card {
                width: 100% !important;
                height: 100% !important;
                max-width: ${maxCardWidth}px !important;
                max-height: ${maxCardHeight}px !important;
                aspect-ratio: 1/1.2 !important;
                margin: 0 auto !important;
            }
            
            .memory-grid {
                display: grid !important;
                place-items: center !important;
                align-content: start !important;
            }
            
            .memory-chinese-character {
                font-size: ${chineseFontSize}rem !important;
                line-height: 1.2 !important;
            }
            
            .memory-pinyin {
                font-size: ${pinyinFontSize}rem !important;
                line-height: 1.1 !important;
            }
            
            .card-front div:first-child {
                font-size: ${Math.min(2.2, maxCardWidth / 30)}rem !important;
            }
            
            .card-inner {
                width: 100% !important;
                height: 100% !important;
            }
            
            /* Contenedor principal */
            .game5-grid-wrapper {
                width: 100% !important;
                height: auto !important;
                max-height: calc(100vh - 140px) !important; /* Más espacio */
                overflow-y: auto !important; /* Permitir scroll si es necesario */
                overflow-x: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important; /* Alinear al inicio */
                align-items: center !important;
                padding: 0.5rem !important;
            }
            
            /* Permitir scroll suave */
            .game5-grid-wrapper::-webkit-scrollbar {
                width: 6px;
            }
            
            .game5-grid-wrapper::-webkit-scrollbar-track {
                background: rgba(93, 64, 55, 0.1);
                border-radius: 3px;
            }
            
            .game5-grid-wrapper::-webkit-scrollbar-thumb {
                background: rgba(93, 64, 55, 0.3);
                border-radius: 3px;
            }
            
            .memory-grid {
                flex: 0 1 auto !important; /* No crecer, encogerse si es necesario */
                min-height: 0 !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    handleResize(gridContainer) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (gridContainer) {
                this.setupGridLayout(gridContainer);
                // No llamar a applyCardSizeConstraints aquí porque
                // setupGridLayout ya lo llama con los parámetros correctos
            }
        }, 100);
    }
    
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card game5-memory-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.word = card.word.ch;
        cardElement.dataset.type = card.type;
        
        // Contenedor interno para efecto 3D
        const innerContainer = document.createElement('div');
        innerContainer.className = 'card-inner game5-card-inner';
        
        // Cara frontal (reverso)
        const frontFace = document.createElement('div');
        frontFace.className = 'card-front game5-card-front';
        
        // Diseño para el reverso
        const patternContainer = document.createElement('div');
        patternContainer.className = 'game5-pattern-container';
        
        const yulinLogo = document.createElement('div');
        yulinLogo.className = 'game5-yulin-logo';
        yulinLogo.textContent = '🌳';
        
        frontFace.appendChild(patternContainer);
        frontFace.appendChild(yulinLogo);
        
        // Cara trasera (contenido)
        const backFace = document.createElement('div');
        backFace.className = 'card-back game5-card-back';
        
        if (card.type === 'image') {
            // Crear contenedor para imagen con fondo marroncito
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container game5-image-container';
            
            // Añadir patrón de fondo
            const imagePattern = document.createElement('div');
            imagePattern.className = 'game5-image-pattern';
            imageContainer.appendChild(imagePattern);
            
            this.getImageUrl(card.word).then(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = card.word.ch;
                imgElement.className = 'game5-card-image';
                
                imgElement.onload = () => {
                    imageContainer.classList.add('loaded');
                };
                imgElement.onerror = () => {
                    // Si falla la imagen, mostrar el carácter chino
                    const placeholder = document.createElement('div');
                    placeholder.textContent = card.word.ch;
                    placeholder.className = 'game5-chinese-character';
                    placeholder.style.fontSize = '2rem';
                    placeholder.style.zIndex = '3';
                    placeholder.style.position = 'absolute';
                    placeholder.style.color = '#5d4037';
                    imageContainer.appendChild(placeholder);
                    imageContainer.classList.add('loaded');
                };
                
                imageContainer.appendChild(imgElement);
            }).catch(() => {
                // En caso de error, mostrar el carácter chino
                const placeholder = document.createElement('div');
                placeholder.textContent = card.word.ch;
                placeholder.className = 'game5-chinese-character';
                placeholder.style.fontSize = '2rem';
                placeholder.style.zIndex = '3';
                placeholder.style.position = 'absolute';
                placeholder.style.color = '#5d4037';
                imageContainer.appendChild(placeholder);
                imageContainer.classList.add('loaded');
            });
            
            backFace.appendChild(imageContainer);
        } else {
            // Para cartas de texto: fondo marroncito con contenido
            const textContainer = document.createElement('div');
            textContainer.className = 'game5-text-content';
            
            // Añadir patrón de fondo
            const textPattern = document.createElement('div');
            textPattern.className = 'game5-image-pattern';
            textContainer.appendChild(textPattern);
            
            // Mostrar texto chino
            const fontClass = this.settings.get('chineseFont') || 'noto-serif';
            
            const chineseElement = document.createElement('div');
            chineseElement.className = `memory-chinese-character game5-chinese-character ${fontClass}`;
            chineseElement.textContent = card.word.ch || '';
            textContainer.appendChild(chineseElement);
            
            // Mostrar pinyin si está configurado
            if (this.settings.get('showPinyin') && card.word.pin) {
                const pinyinElement = document.createElement('div');
                pinyinElement.className = 'memory-pinyin game5-pinyin';
                pinyinElement.textContent = card.word.pin;
                textContainer.appendChild(pinyinElement);
            }
            
            // Marcar como carta de texto
            backFace.classList.add('text-card');
            backFace.appendChild(textContainer);
        }
        
        // Añadir caras al contenedor interno
        innerContainer.appendChild(frontFace);
        innerContainer.appendChild(backFace);
        
        // Añadir contenedor interno a la carta
        cardElement.appendChild(innerContainer);
        
        // Event listener para clic
        cardElement.addEventListener('click', () => this.handleCardClick(cardElement));
        
        return cardElement;
    }

    handleCardClick(cardElement) {
        if (!this.canSelect) return;
        if (cardElement.classList.contains('matched')) return;
        if (this.selectedCards.includes(cardElement)) return;
        if (this.selectedCards.length >= 2) return;
        
        // Iniciar juego si es la primera selección
        if (!this.gameStarted) {
            this.gameStarted = true;
        }
        
        // Voltear carta
        this.flipCard(cardElement);
        
        // Añadir a cartas seleccionadas
        this.selectedCards.push(cardElement);
        
        // Registrar movimiento
        this.moves++;
        this.updateStats();
        
        // Verificar si hay un par completo
        if (this.selectedCards.length === 2) {
            this.canSelect = false;
            
            const card1 = this.selectedCards[0];
            const card2 = this.selectedCards[1];
            
            const word1 = card1.dataset.word;
            const word2 = card2.dataset.word;
            const type1 = card1.dataset.type;
            const type2 = card2.dataset.type;
            
            // Verificar si es un par válido (misma palabra, diferente tipo)
            if (word1 === word2 && type1 !== type2) {
                // ¡Par encontrado!
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    this.selectedCards = [];
                    this.canSelect = true;
                    this.matchedPairs++;
                    this.score += 10;
                    this.updateStats();
                    
                    // Sonido de éxito
                    if (this.ui.soundManager) {
                        this.ui.soundManager.play('correct');
                    }
                    
                    // Verificar si el juego ha terminado
                    if (this.matchedPairs === this.totalPairs) {
                        setTimeout(() => this.endGame(), 500);
                    }
                }, 500);
            } else {
                // No es un par, voltear de nuevo
                setTimeout(() => {
                    this.flipCard(card1);
                    this.flipCard(card2);
                    this.selectedCards = [];
                    this.canSelect = true;
                    
                    // Penalización por movimiento incorrecto
                    this.score = Math.max(0, this.score - 1);
                    this.updateStats();
                    
                    // Sonido de error
                    if (this.ui.soundManager) {
                        this.ui.soundManager.play('wrong');
                    }
                }, 1000);
            }
        }
    }

    flipCard(cardElement) {
        const innerContainer = cardElement.querySelector('.game5-card-inner');
        if (!innerContainer) return;
        
        if (cardElement.classList.contains('flipped')) {
            innerContainer.style.transform = 'rotateY(0deg)';
            cardElement.classList.remove('flipped');
        } else {
            innerContainer.style.transform = 'rotateY(180deg)';
            cardElement.classList.add('flipped');
        }
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (this.gameStarted) {
                this.timeElapsed++;
                this.updateStats();
            }
        }, 1000);
    }

   updateStats() {
        const timeElement = document.getElementById('game5-time');
        const movesElement = document.getElementById('game5-moves');
        const pairsElement = document.getElementById('game5-pairs');
        const scoreElement = document.getElementById('game5-score');
        
        // Actualiza solo si los elementos existen
        if (timeElement) timeElement.textContent = `⏱️ ${this.timeElapsed}s`;
        if (movesElement) movesElement.textContent = `👣 ${this.moves}`;
        if (pairsElement) pairsElement.textContent = `✨ ${this.matchedPairs}/${this.totalPairs}`;
        if (scoreElement) scoreElement.textContent = `🏅 ${this.score}`;
    }

    endGame() {
        console.log('Game5: Fin del juego');
        
        // Detener timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Registrar juego en estadísticas si se completó
        if (this.matchedPairs > 0) {
            this.stats.recordGame();
        }
        
        // Calcular estadísticas finales solo si el juego estaba activo
        if (this.gameStarted) {
            const accuracy = this.totalPairs > 0 ? Math.round((this.matchedPairs / this.totalPairs) * 100) : 0;
            const efficiency = this.moves > 0 ? Math.round((this.matchedPairs / this.moves) * 100) : 0;
            
            // Mostrar popup de resultados
            this.showResultsPopup(accuracy, efficiency);
        } else {
            // Si el juego no había empezado, volver al menú
            this.cleanup();
            this.ui.showScreen('menu-screen');
        }
    }

    showResultsPopup(accuracy, efficiency) {
        const lang = this.settings.get('language');
        const labels = this.labels ? this.labels[lang]?.gameResults : null;
        
        const popup = document.createElement('div');
        popup.className = 'results-popup game5-results-popup';
        
        // Determinar mensaje según puntuación
        let message;
        if (this.matchedPairs === this.totalPairs) {
            message = labels?.perfectGame || '🎉 Perfect Game! 🎉';
        } else if (accuracy >= 80) {
            message = labels?.excellent || '🌟 Excellent! 🌟';
        } else if (accuracy >= 60) {
            message = labels?.goodJob || '😊 Good Job!';
        } else {
            message = labels?.keepPracticing || '💪 Keep Practicing!';
        }
        
        popup.innerHTML = `
            <div class="results-content game5-results-content">
                <h2 class="results-title game5-results-title">${labels?.title || 'Game Results'}</h2>
                <div class="results-message game5-results-message">${message}</div>
                
                <div class="results-stats game5-results-stats">
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Time:</span>
                        <span class="stat-value game5-stat-value">${this.timeElapsed}s</span>
                    </div>
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Moves:</span>
                        <span class="stat-value game5-stat-value">${this.moves}</span>
                    </div>
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Pairs Matched:</span>
                        <span class="stat-value game5-stat-value">${this.matchedPairs}/${this.totalPairs}</span>
                    </div>
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Accuracy:</span>
                        <span class="stat-value game5-stat-value">${accuracy}%</span>
                    </div>
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Efficiency:</span>
                        <span class="stat-value game5-stat-value">${efficiency}%</span>
                    </div>
                    <div class="result-stat game5-result-stat">
                        <span class="stat-label game5-stat-label">Final Score:</span>
                        <span class="stat-value game5-stat-value">${this.score}</span>
                    </div>
                </div>
                
                <div class="results-buttons game5-results-buttons">
                    <button class="results-btn game5-play-again-btn">${labels?.playAgain || '🔄 Play Again'}</button>
                    <button class="results-btn game5-back-menu-btn">${labels?.backToMenu || '🏠 Back to Menu'}</button>
                </div>
            </div>
        `;
        
        // Event listeners
        popup.querySelector('.game5-play-again-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup();
            setTimeout(() => {
                this.startGameSession();
            }, 100);
        });
        
        popup.querySelector('.game5-back-menu-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup();
            this.ui.showScreen('menu-screen');
        });
        
        // Cerrar al hacer click fuera
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
                this.cleanup();
                this.ui.showScreen('menu-screen');
            }
        });
        
        document.body.appendChild(popup);
    }

    cleanup() {
        console.log('Game5.cleanup() - Iniciando limpieza segura');
        
        // 1. Quitar la marca de Game5 activo
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('game5-active');
        }
        
        // 2. Detener timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 3. Remover listeners de redimensionamiento
        window.removeEventListener('resize', this.handleResize);
        
        // 4. Eliminar elementos de Game5
        const game5Elements = document.querySelectorAll(
            '.memory-game-container, .game5-container, .game5-grid-wrapper, .game5-memory-card'
        );
        
        game5Elements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // 5. Limpiar estadísticas de Game5 y restaurar botón de configuración
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (gameStats) {
            const game5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
            game5Stats.forEach(stat => stat.remove());
            
            // Mostrar los elementos originales
            const originalIds = ['question-progress', 'score', 'streak', 'lives'];
            originalIds.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.style.display = 'inline';
                    elem.style.visibility = 'visible';
                    elem.style.opacity = '1';
                }
            });
        }
        
        // 6. RESTAURAR el botón de configuración ⚙️
        if (settingsBtn) {
            settingsBtn.classList.remove('hidden');
            settingsBtn.style.display = 'inline-block';
        }
        
        // 7. Resetear estado interno
        this.selectedCards = [];
        this.canSelect = false;
        this.gameStarted = false;
        
        console.log('Game5.cleanup() - Limpieza completada');
    }

    // GENERACION ALEATORIA
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    
}
