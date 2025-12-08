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
        
        // URL base para las imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Cache para imágenes cargadas
        this.imageCache = new Map();
        
        // Configuración del juego
        this.gridSize = 12; // Número de tarjetas por defecto (6 pares)
        this.gridOptions = [8, 12, 16, 20, 24]; // Opciones de tamaño de grid
        
        // Bind de métodos
        this.handleCardClick = this.handleCardClick.bind(this);
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
        popup.className = 'popup-overlay';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.backgroundColor = 'rgba(0,0,0,0.5)';
        popup.style.display = 'flex';
        popup.style.justifyContent = 'center';
        popup.style.alignItems = 'center';
        popup.style.zIndex = '1000';

        const content = document.createElement('div');
        content.className = 'popup-content';
        content.style.backgroundColor = 'white';
        content.style.padding = '2rem';
        content.style.borderRadius = '12px';
        content.style.maxWidth = '90%';
        content.style.maxHeight = '90%';
        content.style.overflowY = 'auto';
        content.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

        const title = document.createElement('h2');
        title.textContent = '🎮 Memory Game - Setup';
        title.style.marginBottom = '1.5rem';
        title.style.textAlign = 'center';
        title.style.color = '#5d4037';

        // Selector de listado
        const listSection = document.createElement('div');
        listSection.style.marginBottom = '2rem';
        
        const listLabel = document.createElement('h3');
        listLabel.textContent = '1. Select Vocabulary List';
        listLabel.style.marginBottom = '1rem';
        listLabel.style.color = '#795548';
        
        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container';
        listsContainer.style.display = 'flex';
        listsContainer.style.flexDirection = 'column';
        listsContainer.style.gap = '0.5rem';
        listsContainer.style.marginBottom = '1rem';
        listsContainer.style.maxHeight = '200px';
        listsContainer.style.overflowY = 'auto';

        this.availablePictureLists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'vocab-list-btn';
            button.textContent = `${list.title} (${list.level})`;
            button.dataset.filename = list.filename;

            button.style.padding = '1rem';
            button.style.backgroundColor = 'var(--pastel-orange)';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.transition = 'var(--transition)';
            button.style.textAlign = 'left';
            button.style.fontSize = '1rem';
            button.style.color = '#5d4037';

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.vocab-list-btn').forEach(btn => {
                    btn.style.backgroundColor = 'var(--pastel-orange)';
                });
                // Marcar el seleccionado
                button.style.backgroundColor = 'var(--pastel-brown-dark)';
                this.selectedList = list;
            });

            listsContainer.appendChild(button);
        });

        listSection.appendChild(listLabel);
        listSection.appendChild(listsContainer);

        // Selector de tamaño de grid
        const gridSection = document.createElement('div');
        gridSection.style.marginBottom = '2rem';
        
        const gridLabel = document.createElement('h3');
        gridLabel.textContent = '2. Select Difficulty (Number of Cards)';
        gridLabel.style.marginBottom = '1rem';
        gridLabel.style.color = '#795548';
        
        const gridOptionsContainer = document.createElement('div');
        gridOptionsContainer.className = 'grid-options';
        gridOptionsContainer.style.display = 'flex';
        gridOptionsContainer.style.flexWrap = 'wrap';
        gridOptionsContainer.style.gap = '0.5rem';
        gridOptionsContainer.style.justifyContent = 'center';

        this.gridOptions.forEach(size => {
            const button = document.createElement('button');
            button.className = 'grid-option-btn';
            button.textContent = `${size} cards (${size/2} pairs)`;
            button.dataset.size = size;

            button.style.padding = '0.75rem 1rem';
            button.style.backgroundColor = 'var(--pastel-green)';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.transition = 'var(--transition)';
            button.style.fontSize = '0.9rem';
            button.style.color = '#5d4037';

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.grid-option-btn').forEach(btn => {
                    btn.style.backgroundColor = 'var(--pastel-green)';
                });
                // Marcar el seleccionado
                button.style.backgroundColor = 'var(--pastel-green-dark)';
                this.gridSize = size;
            });

            gridOptionsContainer.appendChild(button);
        });

        gridSection.appendChild(gridLabel);
        gridSection.appendChild(gridOptionsContainer);

        // Botones de acción
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '1rem';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.marginTop = '2rem';

        const startButton = document.createElement('button');
        startButton.textContent = '🚀 Start Game';
        startButton.className = 'btn';
        startButton.style.padding = '0.75rem 2rem';
        startButton.style.backgroundColor = 'var(--pastel-brown-dark)';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '8px';
        startButton.style.cursor = 'pointer';
        startButton.style.fontSize = '1.1rem';
        startButton.style.fontWeight = 'bold';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'btn';
        cancelButton.style.padding = '0.75rem 2rem';
        cancelButton.style.backgroundColor = 'var(--pastel-orange)';
        cancelButton.style.color = '#5d4037';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '8px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.fontSize = '1.1rem';

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
            this.ui.showScreen('menu-screen');
        });

        buttonsContainer.appendChild(startButton);
        buttonsContainer.appendChild(cancelButton);

        // Seleccionar primer listado y tamaño por defecto
        if (this.availablePictureLists.length > 0) {
            this.selectedList = this.availablePictureLists[0];
            const firstListBtn = listsContainer.querySelector('.vocab-list-btn');
            if (firstListBtn) firstListBtn.style.backgroundColor = 'var(--pastel-brown-dark)';
            
            // Seleccionar tamaño medio por defecto
            this.gridSize = 12;
            const mediumGridBtn = gridOptionsContainer.querySelector(`[data-size="12"]`);
            if (mediumGridBtn) mediumGridBtn.style.backgroundColor = 'var(--pastel-green-dark)';
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
        
        // Configurar estadísticas del juego
        this.setupGameStats();
        
        // Crear tablero
        this.createBoard();
        
        // Iniciar timer
        this.startTimer();

         // Guardar referencia al manejador original del header
        this.saveOriginalHeaderHandler();
    }

    // Añadir este nuevo método:
    saveOriginalHeaderHandler() {
        const headerHome = document.getElementById('header-home');
        if (headerHome) {
            // Guardar el manejador original
            this.originalHeaderClick = headerHome.onclick;
            
            // Sobrescribir con nuestro manejador
            headerHome.onclick = (e) => {
                this.cleanup();
                if (this.originalHeaderClick) {
                    this.originalHeaderClick(e);
                }
            };
        }
    }
        
    setupGameStats() {
        // Limpiar estadísticas anteriores
        const gameStats = document.getElementById('game-stats');
        if (gameStats) {
            gameStats.innerHTML = '';
            
            // Crear elementos de estadísticas
            const stats = [
                { id: 'time', icon: '⏱️', value: '0s' },
                { id: 'moves', icon: '👣', value: '0' },
                { id: 'pairs', icon: '✨', value: `0/${this.totalPairs}` },
                { id: 'score', icon: '🏅', value: '0' }
            ];
            
            stats.forEach(stat => {
                const statElement = document.createElement('span');
                statElement.id = stat.id;
                statElement.innerHTML = `${stat.icon} ${stat.value}`;
                statElement.style.marginLeft = '1rem';
                statElement.style.fontSize = '1.1rem';
                gameStats.appendChild(statElement);
            });
            
            gameStats.classList.remove('hidden');
        }
    }

    createBoard() {
        const gameScreen = document.getElementById('game-screen');
        
        // Limpiar contenido anterior
        gameScreen.innerHTML = '';
        
        // Crear contenedor principal
        const gameContainer = document.createElement('div');
        gameContainer.className = 'memory-game-container';
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.height = '100%';
        gameContainer.style.padding = '1rem';
        gameContainer.style.overflow = 'hidden'; // Evitar scroll en el contenedor
        
        // Título del juego
        const gameTitle = document.createElement('h2');
        gameTitle.textContent = '🧠 Memory Match';
        gameTitle.style.textAlign = 'center';
        gameTitle.style.marginBottom = '1rem';
        gameTitle.style.color = '#5d4037';
        gameTitle.style.fontSize = '1.5rem';
        
        // Contenedor para el grid que se expandirá
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'memory-grid-wrapper';
        gridWrapper.style.flex = '1';
        gridWrapper.style.display = 'flex';
        gridWrapper.style.flexDirection = 'column';
        gridWrapper.style.minHeight = '0'; // Importante para flexbox
        
        // Crear grid de cartas
        const gridContainer = document.createElement('div');
        gridContainer.className = 'memory-grid';
        gridContainer.id = 'memory-grid';
        
        // Configurar grid responsive dinámico
        this.setupGridLayout(gridContainer);
        
        gridContainer.style.flex = '1';
        gridContainer.style.minHeight = '0'; // Importante para flexbox
        gridContainer.style.overflow = 'auto';
        gridContainer.style.padding = '0.5rem';
        
        // Seleccionar palabras para el juego
        const selectedWords = this.vocabulary.slice(0, this.totalPairs);
        
        // Crear pares de cartas
        const cards = [];
        selectedWords.forEach(word => {
            // Crear dos cartas por palabra (imagen y texto)
            cards.push({
                type: 'image',
                word: word,
                id: `img-${word.ch}`
            });
            
            cards.push({
                type: 'text',
                word: word,
                id: `txt-${word.ch}`
            });
        });
        
        // Mezclar cartas
        this.shuffleArray(cards);
        
        // Crear elementos de cartas
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            gridContainer.appendChild(cardElement);
        });
        
        // Botón de reinicio
        const resetButton = document.createElement('button');
        resetButton.textContent = '🔄 Restart Game';
        resetButton.className = 'btn';
        resetButton.style.margin = '1rem auto';
        resetButton.style.padding = '0.75rem 1.5rem';
        resetButton.style.backgroundColor = 'var(--pastel-orange)';
        resetButton.style.fontSize = '1rem';
        resetButton.style.display = 'block';
        resetButton.style.minWidth = '200px';
        
        resetButton.addEventListener('click', () => {
            this.cleanup();
            this.startGameSession();
        });
        
        // Añadir elementos al DOM
        gridWrapper.appendChild(gridContainer);
        
        gameContainer.appendChild(gameTitle);
        gameContainer.appendChild(gridWrapper);
        gameContainer.appendChild(resetButton);
        gameScreen.appendChild(gameContainer);
        
        // Redimensionar al cambiar tamaño de ventana
        window.addEventListener('resize', () => this.handleResize(gridContainer));
        
        // Añadir evento para volver al menú desde el header
        this.saveOriginalHeaderHandler();
    }
    
    // Añadir nuevos métodos para manejo responsive:
    setupGridLayout(gridContainer) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isLandscape = viewportWidth > viewportHeight;
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Cards: ${this.gridSize}`);
        
        // Calcular número óptimo de columnas basado en el espacio disponible
        let columns;
        
        if (isLandscape) {
            // MODO APAISADO - más columnas
            if (viewportWidth >= 1600) {
                columns = 6;
            } else if (viewportWidth >= 1200) {
                columns = 5;
            } else if (viewportWidth >= 768) {
                columns = 4;
            } else {
                columns = 3;
            }
        } else {
            // MODO VERTICAL - menos columnas
            if (viewportWidth >= 1024) {
                columns = 4;
            } else if (viewportWidth >= 768) {
                columns = 3;
            } else {
                columns = 2;
            }
        }
        
        // Ajustar columnas si tenemos pocas cartas
        if (this.gridSize < columns * 2) {
            columns = Math.max(2, Math.floor(this.gridSize / 2));
        }
        
        // Calcular filas necesarias
        const rows = Math.ceil(this.gridSize / columns);
        
        console.log(`Grid: ${columns}x${rows} (${columns * rows} cells)`);
        
        // Configurar grid
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridAutoRows = '1fr'; // Las filas también se ajustan
        
        // Ajustar gap según tamaño
        const gapSize = Math.min(1, 16 / columns); // Gap más pequeño con más columnas
        gridContainer.style.gap = `${gapSize}rem`;
        
        // Asegurar que el grid ocupe todo el espacio SIN scroll
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
        gridContainer.style.overflow = 'hidden';
        
        // Aplicar tamaño máximo a las cartas
        this.applyCardSizeConstraints();
    }

    applyCardSizeConstraints() {
        // Establecer tamaño máximo para las cartas
        const style = document.createElement('style');
        style.id = 'memory-card-styles';
        
        // Eliminar estilos anteriores si existen
        const oldStyle = document.getElementById('memory-card-styles');
        if (oldStyle) oldStyle.remove();
        
        // Calcular tamaño máximo basado en viewport
        const maxCardWidth = Math.min(180, window.innerWidth / 6); // Máximo 180px, mínimo 1/6 del ancho
        const maxCardHeight = maxCardWidth * 1.2;
        
        style.textContent = `
            .memory-card {
                max-width: ${maxCardWidth}px;
                max-height: ${maxCardHeight}px;
                margin: 0 auto;
            }
            
            .memory-chinese-character {
                font-size: ${Math.min(3, maxCardWidth / 25)}rem !important;
            }
            
            .memory-pinyin {
                font-size: ${Math.min(1.2, maxCardWidth / 40)}rem;
            }
            
            .card-front div:first-child {
                font-size: ${Math.min(2.5, maxCardWidth / 30)}rem;
            }
        `;
        
        document.head.appendChild(style);
    }
        
    calculateCardSize(gridContainer, maxWidth, maxHeight, isLandscape) {
        // Obtener configuración actual del grid
        const computedStyle = getComputedStyle(gridContainer);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        const rows = Math.ceil(this.gridSize / columns);
        
        // Calcular tamaño máximo por carta
        const horizontalGap = 0.75 * (columns - 1); // rem
        const verticalGap = 0.75 * (rows - 1); // rem
        
        // Convertir rem a px (asumiendo 1rem = 16px)
        const gapHorizontalPx = horizontalGap * 16;
        const gapVerticalPx = verticalGap * 16;
        
        // Calcular tamaño disponible para cartas
        const availableWidth = maxWidth - gapHorizontalPx;
        const availableHeight = maxHeight - gapVerticalPx;
        
        // Calcular tamaño de carta basado en la dimensión más restrictiva
        const cardWidth = Math.min(
            availableWidth / columns,
            availableHeight / rows * 0.8 // Factor de aspecto ~1/1.2
        );
        
        const cardHeight = cardWidth * 1.2; // Mantener aspecto 1:1.2
        
        console.log(`Grid: ${columns}x${rows}, Card size: ${cardWidth.toFixed(0)}x${cardHeight.toFixed(0)}px`);
        
        // Aplicar tamaño mínimo y máximo
        const minCardSize = 80; // px
        const maxCardSize = 180; // px
        
        const finalCardWidth = Math.max(minCardSize, Math.min(maxCardSize, cardWidth));
        const finalCardHeight = finalCardWidth * 1.2;
        
        // Aplicar tamaño a las cartas
        gridContainer.style.gridAutoRows = `${finalCardHeight}px`;
        
        // También aplicar tamaño mínimo a las columnas
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, minmax(${finalCardWidth}px, 1fr))`;
        
        // Ajustar padding interno del grid si es necesario
        if (finalCardWidth < 100) {
            gridContainer.style.gap = '0.5rem';
        }
    }
    
    handleResize(gridContainer) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupGridLayout(gridContainer);
            this.applyCardSizeConstraints();
        }, 100);
    }

    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.word = card.word.ch;
        cardElement.dataset.type = card.type;
        
        // Estilos de la carta
        cardElement.style.aspectRatio = '1/1.2';
        cardElement.style.perspective = '1000px';
        cardElement.style.cursor = 'pointer';
        cardElement.style.borderRadius = '12px';
        cardElement.style.overflow = 'hidden';
        
        // Contenedor interno para efecto 3D
        const innerContainer = document.createElement('div');
        innerContainer.className = 'card-inner';
        innerContainer.style.position = 'relative';
        innerContainer.style.width = '100%';
        innerContainer.style.height = '100%';
        innerContainer.style.transition = 'transform 0.6s';
        innerContainer.style.transformStyle = 'preserve-3d';
        
        // Cara frontal (reverso)
        const frontFace = document.createElement('div');
        frontFace.className = 'card-front';
        frontFace.style.position = 'absolute';
        frontFace.style.width = '100%';
        frontFace.style.height = '100%';
        frontFace.style.backfaceVisibility = 'hidden';
        frontFace.style.backgroundColor = 'var(--pastel-brown-dark)';
        frontFace.style.borderRadius = '12px';
        frontFace.style.display = 'flex';
        frontFace.style.alignItems = 'center';
        frontFace.style.justifyContent = 'center';
        frontFace.style.border = '3px solid #5d4037';
        
        // Diseño bonito para el reverso
        const patternContainer = document.createElement('div');
        patternContainer.style.width = '80%';
        patternContainer.style.height = '80%';
        patternContainer.style.backgroundImage = `radial-gradient(circle, var(--pastel-orange) 2px, transparent 2px)`;
        patternContainer.style.backgroundSize = '20px 20px';
        patternContainer.style.opacity = '0.7';
        patternContainer.style.borderRadius = '8px';
        
        const yulinLogo = document.createElement('div');
        yulinLogo.textContent = '🌳';
        yulinLogo.style.fontSize = '2.5rem';
        yulinLogo.style.position = 'absolute';
        yulinLogo.style.zIndex = '1';
        
        frontFace.appendChild(patternContainer);
        frontFace.appendChild(yulinLogo);
        
        // Cara trasera (contenido)
        const backFace = document.createElement('div');
        backFace.className = 'card-back';
        backFace.style.position = 'absolute';
        backFace.style.width = '100%';
        backFace.style.height = '100%';
        backFace.style.backfaceVisibility = 'hidden';
        backFace.style.backgroundColor = 'white';
        backFace.style.borderRadius = '12px';
        backFace.style.transform = 'rotateY(180deg)';
        backFace.style.display = 'flex';
        backFace.style.flexDirection = 'column';
        backFace.style.alignItems = 'center';
        backFace.style.justifyContent = 'center';
        backFace.style.padding = '0.5rem';
        backFace.style.border = '3px solid var(--pastel-orange)';
        backFace.style.overflow = 'hidden';
        
        if (card.type === 'image') {
            // Mostrar imagen
            this.getImageUrl(card.word).then(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = card.word.ch;
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                imgElement.style.objectFit = 'cover';
                imgElement.style.borderRadius = '8px';
                
                // Placeholder mientras carga
                imgElement.style.backgroundColor = 'var(--pastel-orange)';
                imgElement.onload = () => {
                    imgElement.style.backgroundColor = 'transparent';
                };
                imgElement.onerror = () => {
                    imgElement.src = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(card.word.ch.substring(0, 2))}`;
                    imgElement.style.backgroundColor = 'transparent';
                };
                
                backFace.appendChild(imgElement);
            });
        } else {
            // Mostrar texto chino
            const fontClass = this.settings.get('chineseFont') || 'noto-serif';
            
            const chineseElement = document.createElement('div');
            chineseElement.className = `memory-chinese-character ${fontClass}`;
            chineseElement.textContent = card.word.ch || '';
            chineseElement.style.fontSize = '3rem';
            chineseElement.style.fontWeight = 'bold';
            chineseElement.style.color = '#5d4037';
            chineseElement.style.marginBottom = '0.5rem';
            chineseElement.style.textAlign = 'center';
            
            backFace.appendChild(chineseElement);
            
            // Mostrar pinyin si está configurado
            if (this.settings.get('showPinyin') && card.word.pin) {
                const pinyinElement = document.createElement('div');
                pinyinElement.className = 'memory-pinyin';
                pinyinElement.textContent = card.word.pin;
                pinyinElement.style.fontSize = '1.2rem';
                pinyinElement.style.color = '#795548';
                pinyinElement.style.fontStyle = 'italic';
                backFace.appendChild(pinyinElement);
            }
        }
        
        innerContainer.appendChild(frontFace);
        innerContainer.appendChild(backFace);
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
        const innerContainer = cardElement.querySelector('.card-inner');
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
        const timeElement = document.getElementById('time');
        const movesElement = document.getElementById('moves');
        const pairsElement = document.getElementById('pairs');
        const scoreElement = document.getElementById('score');
        
        if (timeElement) timeElement.textContent = `⏱️ ${this.timeElapsed}s`;
        if (movesElement) movesElement.textContent = `👣 ${this.moves}`;
        if (pairsElement) pairsElement.textContent = `✨ ${this.matchedPairs}/${this.totalPairs}`;
        if (scoreElement) scoreElement.textContent = `🏅 ${this.score}`;
    }

    endGame() {
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
            // Si el juego no había empezado, solo volver al menú
            this.ui.goToHome();
        }
    }

    showResultsPopup(accuracy, efficiency) {
        const lang = this.settings.get('language');
        const labels = this.labels ? this.labels[lang]?.gameResults : null;
        
        const popup = document.createElement('div');
        popup.className = 'results-popup';
        
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
            <div class="results-content">
                <h2 class="results-title">${labels?.title || 'Game Results'}</h2>
                <div class="results-message">${message}</div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span class="stat-label">Time:</span>
                        <span class="stat-value">${this.timeElapsed}s</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Moves:</span>
                        <span class="stat-value">${this.moves}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Pairs Matched:</span>
                        <span class="stat-value">${this.matchedPairs}/${this.totalPairs}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Accuracy:</span>
                        <span class="stat-value">${accuracy}%</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Efficiency:</span>
                        <span class="stat-value">${efficiency}%</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Final Score:</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                </div>
                
                <div class="results-buttons">
                    <button class="results-btn play-again">${labels?.playAgain || '🔄 Play Again'}</button>
                    <button class="results-btn back-menu">${labels?.backToMenu || '🏠 Back to Menu'}</button>
                </div>
            </div>
        `;
        
        // Event listeners
        popup.querySelector('.play-again').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup(); // Limpiar antes de reiniciar
            this.startGameSession();
        });
        
        popup.querySelector('.back-menu').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.cleanup();
            this.ui.goToHome();
        });
        
        // Cerrar al hacer click fuera
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
                this.cleanup();
                this.ui.goToHome();
            }
        });
        
        document.body.appendChild(popup);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

cleanup() {
    // Restaurar manejador original del header
    const headerHome = document.getElementById('header-home');
    if (headerHome && this.originalHeaderClick) {
        headerHome.onclick = this.originalHeaderClick;
    }
    
    // Detener timer
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
    
    // Limpiar listeners de cartas
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
    
    // Limpiar estado del juego
    this.selectedCards = [];
    this.canSelect = false;
    this.gameStarted = false;
}

exitGame() {
    this.cleanup();
    this.ui.goToHome();
}
    
}
