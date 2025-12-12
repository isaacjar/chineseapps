// game5.js - Memory Game - VERSION OPTIMIZADA PARA CSS COMPACTO
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
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const scriptContent = await response.text();
            const match = scriptContent.match(/const vocpiclists\s*=\s*(\[.*?\]);/s);
            
            if (match && match[1]) {
                try { this.availablePictureLists = eval(`(${match[1]})`); }
                catch (e) { console.error('Error parseando listados:', e); this.useFallbackPictureLists(); }
            } else { this.useFallbackPictureLists(); }
        } catch (error) { console.error('Error cargando listados:', error); this.useFallbackPictureLists(); }
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
                document.querySelectorAll('.game5-vocab-list-btn').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedList = list;
            });
            listsContainer.appendChild(button);
        });

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
                document.querySelectorAll('.game5-grid-option-btn').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.gridSize = size;
            });
            gridOptionsContainer.appendChild(button);
        });

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
            if (!this.selectedList) { this.ui.showToast('Please select a vocabulary list', 'error'); return; }
            this.ui.showToast(`Loading "${this.selectedList.title}"...`, 'info');
            const success = await this.loadPictureList(this.selectedList.filename);
            if (success) { document.body.removeChild(popup); this.startGameSession(); }
            else { this.ui.showToast(`Error loading "${this.selectedList.title}"`, 'error'); }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(popup);
            this.restoreMenuState();
            this.ui.showScreen('menu-screen');
        });

        // Ensamblar
        buttonsContainer.appendChild(startButton);
        buttonsContainer.appendChild(cancelButton);
        listSection.appendChild(listLabel);
        listSection.appendChild(listsContainer);
        gridSection.appendChild(gridLabel);
        gridSection.appendChild(gridOptionsContainer);
        content.appendChild(title);
        content.appendChild(listSection);
        content.appendChild(gridSection);
        content.appendChild(buttonsContainer);
        popup.appendChild(content);
        document.body.appendChild(popup);

        // Seleccionar por defecto
        if (this.availablePictureLists.length > 0) {
            this.selectedList = this.availablePictureLists[0];
            const firstListBtn = listsContainer.querySelector('.game5-vocab-list-btn');
            if (firstListBtn) firstListBtn.classList.add('selected');
            this.gridSize = 12;
            const mediumGridBtn = gridOptionsContainer.querySelector(`[data-size="12"]`);
            if (mediumGridBtn) mediumGridBtn.classList.add('selected');
        }
    }

    async loadPictureList(filename) {
        try {
            const response = await fetch(`${this.picturesBaseUrl}${filename}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty or invalid list');
            
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            if (this.vocabulary.length === 0) throw new Error('No Chinese characters in this list');
            
            const requiredWords = Math.min(this.gridSize / 2, this.vocabulary.length);
            if (requiredWords < this.gridSize / 2) {
                this.ui.showToast(`Warning: List has only ${this.vocabulary.length} words, using ${requiredWords * 2} cards`, 'info');
                this.gridSize = requiredWords * 2;
            }
            
            console.log(`List "${filename}" loaded: ${this.vocabulary.length} words`);
            await this.preloadImages();
            return true;
            
        } catch (error) {
            console.error('Error loading image list:', error);
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
        if (this.imageCache.has(cacheKey)) return this.imageCache.get(cacheKey);
        
        let imageUrl = word.pic ? `${this.picFolderUrl}${word.pic}` : `${this.picFolderUrl}${word.ch}.png`;
        
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) { this.imageCache.set(cacheKey, imageUrl); return imageUrl; }
        } catch {}
        
        const placeholderUrl = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(word.ch.substring(0, 2))}`;
        this.imageCache.set(cacheKey, placeholderUrl);
        return placeholderUrl;
    }

   startGameSession() {
        console.log('🚀 startGameSession() INICIADO');
        
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.totalPairs = this.gridSize / 2;
        this.selectedCards = [];
        this.canSelect = true;
        this.timeElapsed = 0;
        this.gameStarted = false;
        
        console.log('📺 Mostrando pantalla de juego...');
        this.ui.showScreen('game-screen');
        
        const gameScreen = document.getElementById('game-screen');
        console.log('🖥️ game-screen encontrado:', !!gameScreen);
        
        console.log('🏷️ Añadiendo clase game5-active...');
        gameScreen.classList.add('game5-active');
        console.log('✅ Clase añadida:', gameScreen.classList.contains('game5-active'));
        
        console.log('📊 Configurando estadísticas...');
        this.setupGameStats();
        this.updateStats();
        
        console.log('🎲 Creando tablero...');
        this.createBoard();
        
        console.log('⏰ Iniciando timer...');
        this.startTimer();
        
        console.log('✅ startGameSession() COMPLETADO');
        
        // DEPURACIÓN EXTRA - Verificar después de 1 segundo
        setTimeout(() => {
            console.log('🔍 VERIFICACIÓN FINAL (1s después):');
            console.log('- Elementos .game5-container:', document.querySelectorAll('.game5-container').length);
            console.log('- Elementos .game5-grid:', document.querySelectorAll('.game5-grid').length);
            console.log('- Elementos .game5-memory-card:', document.querySelectorAll('.game5-memory-card').length);
            
            // Forzar un color rojo para ver si los elementos existen
            const cards = document.querySelectorAll('.game5-memory-card');
            cards.forEach(card => {
                card.style.backgroundColor = 'red !important';
                card.style.border = '3px solid yellow !important';
            });
        }, 1000);
    }
        
    setupGameStats() {
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        if (!gameStats) return;
        
        if (settingsBtn) { settingsBtn.classList.add('hidden'); settingsBtn.style.display = 'none'; }
        
        const existingGame5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
        existingGame5Stats.forEach(stat => stat.remove());
        
        const originalIds = ['question-progress', 'score', 'streak', 'lives'];
        originalIds.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) { elem.style.display = 'none'; elem.style.visibility = 'hidden'; elem.style.opacity = '0'; }
        });
        
        const restartButton = document.createElement('button');
        restartButton.id = 'game5-restart-btn';
        restartButton.className = 'game5-stat game5-restart-btn';
        restartButton.innerHTML = '🔄';
        restartButton.title = 'Restart Game';
        restartButton.addEventListener('click', () => { this.cleanup(); this.startGameSession(); });
        gameStats.appendChild(restartButton);
            
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
            statElement.style.display = 'inline-block';
            statElement.style.visibility = 'visible';
            statElement.style.opacity = '1';
            gameStats.appendChild(statElement);
        });
        
        gameStats.classList.remove('hidden');
        gameStats.style.display = 'flex';
        gameStats.style.visibility = 'visible';
        gameStats.style.opacity = '1';
    }
    
    restoreMenuState() {
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        if (!gameStats) return;
        
        const game5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
        game5Stats.forEach(stat => stat.remove());
        
        const originalIds = ['question-progress', 'score', 'streak', 'lives'];
        originalIds.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.style.display = 'inline';
        });
        
        if (settingsBtn) { settingsBtn.classList.remove('hidden'); settingsBtn.style.display = 'inline-block'; }
        gameStats.classList.add('hidden');
    }
        
   createBoard() {
        const gameScreen = document.getElementById('game-screen');
        console.log('🔍 createBoard() - gameScreen:', gameScreen ? 'ENCONTRADO' : 'NO ENCONTRADO');
        console.log('🔍 gameScreen tiene clase game5-active:', gameScreen.classList.contains('game5-active'));
        
        const existingContainers = document.querySelectorAll('.memory-game-container, .game5-container, .game5-grid-wrapper');
        console.log('🗑️ Contenedores existentes a eliminar:', existingContainers.length);
        
        existingContainers.forEach(container => {
            if (container && container.parentNode) {
                console.log('Eliminando contenedor:', container.className);
                container.parentNode.removeChild(container);
            }
        });
        
        const gameContainer = document.createElement('div');
        gameContainer.className = 'memory-game-container game5-container';
        console.log('📦 Creado gameContainer con clases:', gameContainer.className);
        
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'game5-grid-wrapper';
        gridWrapper.style.cssText = 'width: 100%; height: auto; max-height: calc(100vh - 100px); overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2px; box-sizing: border-box; scroll-behavior: smooth; background-color: rgba(255,0,0,0.1) !important;'; // Color temporal para debug
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'memory-grid game5-grid';
        gridContainer.id = 'memory-grid';
        gridContainer.style.cssText = 'flex: 1; min-height: 0; max-height: 100%; width: 100%; background-color: rgba(0,255,0,0.1) !important;'; // Color temporal para debug
        
        const cards = this.generateCards();
        console.log('🎴 Cartas generadas:', cards.length);
        
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            gridContainer.appendChild(cardElement);
        });
        
        console.log('🎴 Cartas añadidas al grid:', gridContainer.children.length);
        
        gridWrapper.appendChild(gridContainer);
        gameContainer.appendChild(gridWrapper);
        gameScreen.appendChild(gameContainer);
        
        console.log('✅ Elementos añadidos al DOM:');
        console.log('- gameContainer añadido:', document.contains(gameContainer));
        console.log('- gridWrapper añadido:', document.contains(gridWrapper));
        console.log('- gridContainer añadido:', document.contains(gridContainer));
        
        // Verificar estilos inmediatamente
        setTimeout(() => {
            console.log('🔍 Verificación de estilos CSS:');
            console.log('- gameContainer display:', window.getComputedStyle(gameContainer).display);
            console.log('- gridContainer display:', window.getComputedStyle(gridContainer).display);
            console.log('- gridContainer grid:', window.getComputedStyle(gridContainer).gridTemplateColumns);
            
            const cardsInGrid = gridContainer.querySelectorAll('.game5-memory-card');
            console.log('- Cartas en grid:', cardsInGrid.length);
            
            if (cardsInGrid.length > 0) {
                const firstCard = cardsInGrid[0];
                console.log('- Primera carta:', {
                    width: window.getComputedStyle(firstCard).width,
                    height: window.getComputedStyle(firstCard).height,
                    display: window.getComputedStyle(firstCard).display,
                    visibility: window.getComputedStyle(firstCard).visibility
                });
            }
        }, 50);
        
        setTimeout(() => { 
            if (gridContainer) {
                console.log('⚙️ Configurando layout del grid...');
                this.setupGridLayout(gridContainer); 
            } else {
                console.error('❌ gridContainer es null o undefined');
            }
        }, 100);
        
        if (gridContainer) {
            window.addEventListener('resize', () => this.handleResize(gridContainer));
        }
    }
    
    generateCards() {
        const cards = [];
        const selectedWords = this.getRandomWords(this.totalPairs);
        
        selectedWords.forEach((word, index) => {
            cards.push({ id: index * 2, word: word, type: 'image' });
            cards.push({ id: index * 2 + 1, word: word, type: 'text' });
        });
        
        return this.shuffleArray(cards);
    }
    
    getRandomWords(count) {
        const shuffled = [...this.vocabulary];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    
    setupGridLayout(gridContainer) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isLandscape = viewportWidth > viewportHeight;
        
        console.log(`Game5 - Viewport: ${viewportWidth}x${viewportHeight}, Cards: ${this.gridSize}`);
        
        // ALTURAS OPTIMIZADAS PARA CSS COMPACTO
        const headerHeight = 50; // Reducido de 80px para CSS compacto
        const availableHeight = viewportHeight - headerHeight - 30; // Menos margen
        const availableWidth = viewportWidth - 20; // Menos margen horizontal
        
        // ESPACIOS COMPACTOS
        const horizontalGap = 2; // Ultra compacto (CSS tiene 2px)
        const verticalGap = 2;   // Ultra compacto
        
        // Cálculo de columnas más agresivo para aprovechar espacio
        let columns, rows;
        
        // Lógica más agresiva para aprovechar espacio horizontal
        if (this.gridSize <= 12) {
            columns = isLandscape ? 6 : 4; // Más columnas en landscape
        } else if (this.gridSize <= 16) {
            columns = isLandscape ? 6 : 4;
        } else if (this.gridSize <= 20) {
            columns = isLandscape ? 7 : 5;
        } else if (this.gridSize <= 24) {
            columns = isLandscape ? 8 : 6;
        } else {
            columns = isLandscape ? 10 : 6; // Más columnas para 32 cartas
        }
        
        // Tamaño mínimo de carta más pequeño para CSS compacto
        const minCardWidth = 60; // Reducido de 70px
        const maxCardWidth = 120; // Reducido de 180px
        
        const maxColumnsByWidth = Math.floor(availableWidth / (minCardWidth + horizontalGap));
        columns = Math.min(columns, maxColumnsByWidth);
        columns = Math.max(3, columns); // Mínimo 3 columnas
        
        rows = Math.ceil(this.gridSize / columns);
        
        // Ajustar si hay demasiadas filas
        const maxVisibleRows = Math.floor(availableHeight / (minCardWidth * 1.2 + verticalGap));
        if (rows > maxVisibleRows) {
            columns = Math.ceil(this.gridSize / maxVisibleRows);
            rows = Math.ceil(this.gridSize / columns);
        }
        
        columns = Math.min(columns, maxColumnsByWidth);
        columns = Math.max(3, columns);
        
        console.log(`Game5 Compacto - Grid: ${columns} columns x ${rows} rows`);
        
        // Calcular tamaño con gaps ultra compactos
        const cardWidth = Math.max(
            minCardWidth,
            Math.min(maxCardWidth, Math.floor((availableWidth - (columns - 1) * horizontalGap) / columns))
        );
        
        const cardHeight = cardWidth * 1.2;
        const neededHeight = (cardHeight * rows) + ((rows - 1) * verticalGap);
        
        if (neededHeight > availableHeight) {
            const maxCardHeight = Math.floor((availableHeight - ((rows - 1) * verticalGap)) / rows);
            const adjustedCardWidth = maxCardHeight / 1.2;
            
            if (adjustedCardWidth >= minCardWidth) {
                const finalCardWidth = Math.min(cardWidth, adjustedCardWidth);
                const finalCardHeight = finalCardWidth * 1.2;
                console.log(`Game5 - Ajustado por altura: ${finalCardWidth}px x ${finalCardHeight}px`);
                this.applyCardSizeConstraints(finalCardWidth, finalCardHeight);
            } else {
                columns = Math.min(columns + 1, maxColumnsByWidth);
                rows = Math.ceil(this.gridSize / columns);
                console.log(`Game5 - Recalculado: ${columns} columns x ${rows} rows`);
                
                const newCardWidth = Math.max(
                    minCardWidth,
                    Math.min(maxCardWidth, Math.floor((availableWidth - (columns - 1) * horizontalGap) / columns))
                );
                const newCardHeight = newCardWidth * 1.2;
                this.applyCardSizeConstraints(newCardWidth, newCardHeight);
            }
        } else {
            console.log(`Game5 - Card size: ${cardWidth}px x ${cardHeight}px`);
            this.applyCardSizeConstraints(cardWidth, cardHeight);
        }
        
        // Configurar grid con espacios ultra compactos
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gap = `${verticalGap}px ${horizontalGap}px`;
        gridContainer.style.padding = '2px'; // Ultra compacto
        gridContainer.style.boxSizing = 'border-box';
        gridContainer.style.width = 'auto'; // Importante para centrado
        gridContainer.style.height = 'auto';
        gridContainer.style.minHeight = '0';
        gridContainer.style.maxHeight = `${Math.min(neededHeight, availableHeight)}px`;
        gridContainer.style.overflow = 'visible';
        gridContainer.style.placeItems = 'center';
        gridContainer.style.alignContent = 'center';
        gridContainer.style.justifyContent = 'center';
        gridContainer.style.margin = '0 auto';
    }
    
    applyCardSizeConstraints(cardWidth, cardHeight) {
        const style = document.createElement('style');
        style.id = 'memory-card-styles';
        const oldStyle = document.getElementById('memory-card-styles');
        if (oldStyle) oldStyle.remove();
        
        const maxCardWidth = cardWidth || 80;
        const maxCardHeight = cardHeight || 96;
        
        // FUENTES MÁS PEQUEÑAS PARA CSS COMPACTO
        const chineseFontSize = Math.min(1.5, maxCardWidth / 30);
        const pinyinFontSize = Math.min(0.7, maxCardWidth / 60);
        
        style.textContent = `
            /* ESTILOS ESPECÍFICOS CUANDO GAME5 ESTÁ ACTIVO */
            #game-screen.game5-active .memory-card,
            #game-screen.game5-active .game5-memory-card {
                width: ${maxCardWidth}px !important;
                height: ${maxCardHeight}px !important;
                min-width: ${maxCardWidth}px !important;
                min-height: ${maxCardHeight}px !important;
                aspect-ratio: 1/1.2 !important;
                margin: 0 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            #game-screen.game5-active .memory-grid,
            #game-screen.game5-active .game5-grid {
                display: grid !important;
                place-items: center !important;
                align-content: center !important;
                justify-content: center !important;
                width: auto !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            #game-screen.game5-active .memory-chinese-character,
            #game-screen.game5-active .game5-chinese-character {
                font-size: ${chineseFontSize}rem !important;
                line-height: 1 !important;
                margin: 0 !important;
                padding: 0 !important;
                visibility: visible !important;
            }
            
            #game-screen.game5-active .memory-pinyin,
            #game-screen.game5-active .game5-pinyin {
                font-size: ${pinyinFontSize}rem !important;
                line-height: 1 !important;
                margin: 0 !important;
                padding: 0 !important;
                visibility: visible !important;
            }
            
            #game-screen.game5-active .card-front div:first-child {
                font-size: ${Math.min(1.5, maxCardWidth / 40)}rem !important;
            }
            
            #game-screen.game5-active .card-inner,
            #game-screen.game5-active .game5-card-inner {
                width: 100% !important;
                height: 100% !important;
            }
            
            /* Wrapper ultra compacto */
            #game-screen.game5-active .game5-grid-wrapper {
                width: 100% !important;
                height: auto !important;
                max-height: calc(100vh - 100px) !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                padding: 2px !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Contenedor principal */
            #game-screen.game5-active .memory-game-container.game5-container {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Scroll fino */
            #game-screen.game5-active .game5-grid-wrapper::-webkit-scrollbar {
                width: 4px;
            }
            
            #game-screen.game5-active .game5-grid-wrapper::-webkit-scrollbar-track {
                background: rgba(93, 64, 55, 0.05);
                border-radius: 2px;
            }
            
            #game-screen.game5-active .game5-grid-wrapper::-webkit-scrollbar-thumb {
                background: rgba(93, 64, 55, 0.2);
                border-radius: 2px;
            }
            
            #game-screen.game5-active .memory-grid {
                flex: 0 1 auto !important;
                min-height: 0 !important;
            }
            
            /* Ajustes específicos para cartas compactas */
            #game-screen.game5-active .game5-card-back {
                padding: 1px !important;
                border-width: 1px !important;
            }
            
            #game-screen.game5-active .game5-text-content {
                padding: 1px !important;
            }
            
            #game-screen.game5-active .game5-card-image {
                max-width: 70% !important;
                max-height: 70% !important;
            }
            
            /* Asegurar que las cartas sean visibles */
            #game-screen.game5-active .game5-memory-card {
                background-color: var(--pastel-brown-dark) !important;
                border-radius: 4px !important;
                overflow: hidden !important;
            }
            
            #game-screen.game5-active .game5-card-front {
                background-color: var(--pastel-brown-dark) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            #game-screen.game5-active .game5-card-back {
                background-color: white !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Estilos CSS aplicados para Game5 activo');
    }
    
    handleResize(gridContainer) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (gridContainer) this.setupGridLayout(gridContainer);
        }, 100);
    }
    
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card game5-memory-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.word = card.word.ch;
        cardElement.dataset.type = card.type;
        
        const innerContainer = document.createElement('div');
        innerContainer.className = 'card-inner game5-card-inner';
        
        // Cara frontal
        const frontFace = document.createElement('div');
        frontFace.className = 'card-front game5-card-front';
        const patternContainer = document.createElement('div');
        patternContainer.className = 'game5-pattern-container';
        const yulinLogo = document.createElement('div');
        yulinLogo.className = 'game5-yulin-logo';
        yulinLogo.textContent = '🌳';
        frontFace.appendChild(patternContainer);
        frontFace.appendChild(yulinLogo);
        
        // Cara trasera
        const backFace = document.createElement('div');
        backFace.className = 'card-back game5-card-back';
        
        if (card.type === 'image') {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container game5-image-container';
            const imagePattern = document.createElement('div');
            imagePattern.className = 'game5-image-pattern';
            imageContainer.appendChild(imagePattern);
            
            this.getImageUrl(card.word).then(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = card.word.ch;
                imgElement.className = 'game5-card-image';
                imgElement.onload = () => imageContainer.classList.add('loaded');
                imgElement.onerror = () => {
                    const placeholder = document.createElement('div');
                    placeholder.textContent = card.word.ch;
                    placeholder.className = 'game5-chinese-character';
                    placeholder.style.cssText = 'font-size: 1.2rem !important; z-index: 3; position: absolute; color: #5d4037;';
                    imageContainer.appendChild(placeholder);
                    imageContainer.classList.add('loaded');
                };
                imageContainer.appendChild(imgElement);
            }).catch(() => {
                const placeholder = document.createElement('div');
                placeholder.textContent = card.word.ch;
                placeholder.className = 'game5-chinese-character';
                placeholder.style.cssText = 'font-size: 1.2rem !important; z-index: 3; position: absolute; color: #5d4037;';
                imageContainer.appendChild(placeholder);
                imageContainer.classList.add('loaded');
            });
            
            backFace.appendChild(imageContainer);
        } else {
            const textContainer = document.createElement('div');
            textContainer.className = 'game5-text-content';
            const textPattern = document.createElement('div');
            textPattern.className = 'game5-image-pattern';
            textContainer.appendChild(textPattern);
            
            const fontClass = this.settings.get('chineseFont') || 'noto-serif';
            const chineseElement = document.createElement('div');
            chineseElement.className = `memory-chinese-character game5-chinese-character ${fontClass}`;
            chineseElement.textContent = card.word.ch || '';
            textContainer.appendChild(chineseElement);
            
            if (this.settings.get('showPinyin') && card.word.pin) {
                const pinyinElement = document.createElement('div');
                pinyinElement.className = 'memory-pinyin game5-pinyin';
                pinyinElement.textContent = card.word.pin;
                textContainer.appendChild(pinyinElement);
            }
            
            backFace.classList.add('text-card');
            backFace.appendChild(textContainer);
        }
        
        innerContainer.appendChild(frontFace);
        innerContainer.appendChild(backFace);
        cardElement.appendChild(innerContainer);
        cardElement.addEventListener('click', () => this.handleCardClick(cardElement));
        
        return cardElement;
    }

    handleCardClick(cardElement) {
        if (!this.canSelect || cardElement.classList.contains('matched') || 
            this.selectedCards.includes(cardElement) || this.selectedCards.length >= 2) return;
        
        if (!this.gameStarted) this.gameStarted = true;
        
        this.flipCard(cardElement);
        this.selectedCards.push(cardElement);
        this.moves++;
        this.updateStats();
        
        if (this.selectedCards.length === 2) {
            this.canSelect = false;
            const card1 = this.selectedCards[0];
            const card2 = this.selectedCards[1];
            const word1 = card1.dataset.word;
            const word2 = card2.dataset.word;
            const type1 = card1.dataset.type;
            const type2 = card2.dataset.type;
            
            if (word1 === word2 && type1 !== type2) {
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    this.selectedCards = [];
                    this.canSelect = true;
                    this.matchedPairs++;
                    this.score += 10;
                    this.updateStats();
                    if (this.ui.soundManager) this.ui.soundManager.play('correct');
                    if (this.matchedPairs === this.totalPairs) setTimeout(() => this.endGame(), 500);
                }, 500);
            } else {
                setTimeout(() => {
                    this.flipCard(card1);
                    this.flipCard(card2);
                    this.selectedCards = [];
                    this.canSelect = true;
                    this.score = Math.max(0, this.score - 1);
                    this.updateStats();
                    if (this.ui.soundManager) this.ui.soundManager.play('wrong');
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
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.gameStarted) { this.timeElapsed++; this.updateStats(); }
        }, 1000);
    }

   updateStats() {
        const timeElement = document.getElementById('game5-time');
        const movesElement = document.getElementById('game5-moves');
        const pairsElement = document.getElementById('game5-pairs');
        const scoreElement = document.getElementById('game5-score');
        
        if (timeElement) timeElement.textContent = `⏱️ ${this.timeElapsed}s`;
        if (movesElement) movesElement.textContent = `👣 ${this.moves}`;
        if (pairsElement) pairsElement.textContent = `✨ ${this.matchedPairs}/${this.totalPairs}`;
        if (scoreElement) scoreElement.textContent = `🏅 ${this.score}`;
    }

    endGame() {
        console.log('Game5: Fin del juego');
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this.matchedPairs > 0) this.stats.recordGame();
        
        if (this.gameStarted) {
            const accuracy = this.totalPairs > 0 ? Math.round((this.matchedPairs / this.totalPairs) * 100) : 0;
            const efficiency = this.moves > 0 ? Math.round((this.matchedPairs / this.moves) * 100) : 0;
            this.showResultsPopup(accuracy, efficiency);
        } else {
            this.cleanup();
            this.ui.showScreen('menu-screen');
        }
    }

    showResultsPopup(accuracy, efficiency) {
        const lang = this.settings.get('language');
        const labels = this.labels ? this.labels[lang]?.gameResults : null;
        
        const popup = document.createElement('div');
        popup.className = 'results-popup game5-results-popup';
        
        let message;
        if (this.matchedPairs === this.totalPairs) message = labels?.perfectGame || '🎉 Perfect Game! 🎉';
        else if (accuracy >= 80) message = labels?.excellent || '🌟 Excellent! 🌟';
        else if (accuracy >= 60) message = labels?.goodJob || '😊 Good Job!';
        else message = labels?.keepPracticing || '💪 Keep Practicing!';
        
        popup.innerHTML = `
            <div class="results-content game5-results-content">
                <h2 class="results-title game5-results-title">${labels?.title || 'Game Results'}</h2>
                <div class="results-message game5-results-message">${message}</div>
                <div class="results-stats game5-results-stats">
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Time:</span><span class="stat-value game5-stat-value">${this.timeElapsed}s</span></div>
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Moves:</span><span class="stat-value game5-stat-value">${this.moves}</span></div>
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Pairs Matched:</span><span class="stat-value game5-stat-value">${this.matchedPairs}/${this.totalPairs}</span></div>
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Accuracy:</span><span class="stat-value game5-stat-value">${accuracy}%</span></div>
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Efficiency:</span><span class="stat-value game5-stat-value">${efficiency}%</span></div>
                    <div class="result-stat game5-result-stat"><span class="stat-label game5-stat-label">Final Score:</span><span class="stat-value game5-stat-value">${this.score}</span></div>
                </div>
                <div class="results-buttons game5-results-buttons">
                    <button class="results-btn game5-play-again-btn">${labels?.playAgain || '🔄 Play Again'}</button>
                    <button class="results-btn game5-back-menu-btn">${labels?.backToMenu || '🏠 Back to Menu'}</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.game5-play-again-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup();
            setTimeout(() => this.startGameSession(), 100);
        });
        
        popup.querySelector('.game5-back-menu-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup();
            this.ui.showScreen('menu-screen');
        });
        
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
        
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) gameScreen.classList.remove('game5-active');
        
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        window.removeEventListener('resize', this.handleResize);
        
        const game5Elements = document.querySelectorAll('.memory-game-container, .game5-container, .game5-grid-wrapper, .game5-memory-card');
        game5Elements.forEach(element => {
            if (element && element.parentNode) element.parentNode.removeChild(element);
        });
        
        const gameStats = document.getElementById('game-stats');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (gameStats) {
            const game5Stats = gameStats.querySelectorAll('.game5-stat, .game5-restart-btn');
            game5Stats.forEach(stat => stat.remove());
            
            const originalIds = ['question-progress', 'score', 'streak', 'lives'];
            originalIds.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) { elem.style.display = 'inline'; elem.style.visibility = 'visible'; elem.style.opacity = '1'; }
            });
        }
        
        if (settingsBtn) { settingsBtn.classList.remove('hidden'); settingsBtn.style.display = 'inline-block'; }
        
        this.selectedCards = [];
        this.canSelect = false;
        this.gameStarted = false;
        
        console.log('Game5.cleanup() - Limpieza completada');
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

// Añade este método a la clase Game5
debugCheckVisibility() {
    console.log('=== DEBUG VISIBILIDAD ===');
    
    const gameScreen = document.getElementById('game-screen');
    console.log('1. game-screen:', gameScreen ? 'EXISTE' : 'NO EXISTE');
    console.log('2. Tiene clase game5-active:', gameScreen?.classList.contains('game5-active'));
    
    const containers = [
        '.game5-container',
        '.game5-grid-wrapper', 
        '.game5-grid',
        '.game5-memory-card'
    ];
    
    containers.forEach(selector => {
        const element = document.querySelector(selector);
        console.log(`${selector}:`, element ? 'EXISTE' : 'NO EXISTE');
        if (element) {
            const style = window.getComputedStyle(element);
            console.log(`  - display: ${style.display}`);
            console.log(`  - visibility: ${style.visibility}`);
            console.log(`  - opacity: ${style.opacity}`);
            console.log(`  - width: ${style.width}`);
            console.log(`  - height: ${style.height}`);
        }
    });
    
    // Verificar estilos dinámicos
    const dynamicStyle = document.getElementById('memory-card-styles');
    console.log('Estilo dinámico memory-card-styles:', dynamicStyle ? 'EXISTE' : 'NO EXISTE');
    if (dynamicStyle) {
        console.log('Contenido del estilo:', dynamicStyle.textContent.substring(0, 200) + '...');
    }
}
    
}
