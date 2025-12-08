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
            button.style.backgroundColor = '#ffd8a6';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.textAlign = 'left';
            button.style.fontSize = '1rem';
            button.style.color = '#5d4037';

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.vocab-list-btn').forEach(btn => {
                    btn.style.backgroundColor = '#ffd8a6';
                });
                // Marcar el seleccionado
                button.style.backgroundColor = '#5d4037';
                button.style.color = 'white';
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
            button.style.backgroundColor = '#c8e6c9';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.fontSize = '0.9rem';
            button.style.color = '#5d4037';

            button.addEventListener('click', () => {
                // Desmarcar todos los botones
                document.querySelectorAll('.grid-option-btn').forEach(btn => {
                    btn.style.backgroundColor = '#c8e6c9';
                });
                // Marcar el seleccionado
                button.style.backgroundColor = '#a5d6a7';
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
        startButton.style.backgroundColor = '#5d4037';
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
        cancelButton.style.backgroundColor = '#ffd8a6';
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
            if (firstListBtn) {
                firstListBtn.style.backgroundColor = '#5d4037';
                firstListBtn.style.color = 'white';
            }
            
            // Seleccionar tamaño medio por defecto
            this.gridSize = 12;
            const mediumGridBtn = gridOptionsContainer.querySelector(`[data-size="12"]`);
            if (mediumGridBtn) mediumGridBtn.style.backgroundColor = '#a5d6a7';
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
        
        // Aplicar estilos CSS dinámicos
        this.applyMemoryGameStyles();
    }

    applyMemoryGameStyles() {
        const style = document.createElement('style');
        style.id = 'memory-game-styles';
        
        // Eliminar estilos anteriores si existen
        const oldStyle = document.getElementById('memory-game-styles');
        if (oldStyle) oldStyle.remove();
        
        style.textContent = `
            /* MEMORY GAME STYLES */
            .memory-game-container {
                display: flex;
                flex-direction: column;
                height: calc(100vh - 120px);
                padding: 0.5rem;
                box-sizing: border-box;
                overflow: hidden;
            }
            
            .memory-grid {
                display: grid;
                width: 100%;
                height: 100%;
                overflow: hidden !important;
                place-items: center;
                gap: 0.25rem;
                padding: 0.25rem;
            }
            
            .memory-card {
                width: 100%;
                height: 100%;
                max-width: 180px;
                max-height: 216px;
                transition: transform 0.3s ease;
                transform-style: preserve-3d;
                position: relative;
                margin: 0 !important;
                aspect-ratio: 1/1.2;
                perspective: 1000px;
                cursor: pointer;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .memory-card.matched {
                opacity: 0.7;
                transform: scale(0.95);
            }
            
            .memory-card.flipped .card-inner {
                transform: rotateY(180deg);
            }
            
            .card-inner {
                width: 100%;
                height: 100%;
                transition: transform 0.6s;
                transform-style: preserve-3d;
                position: relative;
            }
            
            .card-front, .card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border-width: 2px;
            }
            
            .card-front {
                background-color: #5d4037;
                border: 2px solid #5d4037;
            }
            
            .card-back {
                transform: rotateY(180deg);
                background: white;
                border: 2px solid #ffd8a6;
            }
            
            .memory-chinese-character {
                font-size: 2.5rem;
                font-weight: bold;
                color: #5d4037;
                text-align: center;
                line-height: 1;
                margin: 0;
                padding: 0.5rem;
            }
            
            .memory-pinyin {
                font-size: 1rem;
                color: #795548;
                font-style: italic;
                margin-top: 0.25rem;
            }
            
            .image-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #ffd8a6;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .image-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            
            /* Popup de resultados */
            .memory-results-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: memory-fadeIn 0.3s ease;
            }
            
            .memory-results-content {
                background: white;
                padding: 2rem;
                border-radius: 16px;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                animation: memory-slideUp 0.4s ease;
            }
            
            .memory-results-title {
                color: #5d4037;
                text-align: center;
                margin-bottom: 1.5rem;
                font-size: 2rem;
            }
            
            .memory-results-message {
                text-align: center;
                font-size: 1.5rem;
                margin-bottom: 2rem;
                padding: 1rem;
                background: linear-gradient(135deg, #ffd8a6, #fff9c4);
                border-radius: 12px;
                color: #5d4037;
                font-weight: bold;
            }
            
            .memory-results-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .memory-result-stat {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem;
                background: #f9f5f0;
                border-radius: 8px;
                border-left: 4px solid #c8e6c9;
            }
            
            .memory-stat-label {
                font-weight: bold;
                color: #795548;
            }
            
            .memory-stat-value {
                font-weight: bold;
                color: #5d4037;
            }
            
            .memory-results-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .memory-results-btn {
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
            }
            
            .memory-results-btn.play-again {
                background: #c8e6c9;
                color: #5d4037;
            }
            
            .memory-results-btn.back-menu {
                background: #ffd8a6;
                color: #5d4037;
            }
            
            .memory-results-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            /* Animaciones */
            @keyframes memory-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes memory-slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .memory-chinese-character {
                    font-size: 2rem !important;
                }
                
                .memory-pinyin {
                    font-size: 0.9rem !important;
                }
                
                .memory-results-content {
                    padding: 1.5rem;
                }
                
                .memory-results-title {
                    font-size: 1.5rem;
                }
                
                .memory-results-message {
                    font-size: 1.2rem;
                }
                
                .memory-results-stats {
                    grid-template-columns: 1fr;
                }
                
                .memory-results-buttons {
                    flex-direction: column;
                }
                
                .memory-results-btn {
                    width: 100%;
                }
                
                .memory-card {
                    max-width: 140px !important;
                    max-height: 168px !important;
                }
            }
            
            @media (max-width: 480px) {
                .memory-grid {
                    gap: 0.125rem !important;
                    padding: 0.125rem;
                }
                
                .memory-card {
                    max-width: 110px !important;
                    max-height: 132px !important;
                }
                
                .memory-chinese-character {
                    font-size: 1.8rem !important;
                }
                
                .memory-pinyin {
                    font-size: 0.8rem !important;
                }
            }
            
            @media (max-width: 360px) {
                .memory-card {
                    max-width: 95px !important;
                    max-height: 114px !important;
                }
                
                .memory-chinese-character {
                    font-size: 1.5rem !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

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
        
        // Contenedor principal que usa TODO el espacio disponible
        const gameContainer = document.createElement('div');
        gameContainer.className = 'memory-game-container';
        
        // Título compacto
        const gameTitle = document.createElement('h2');
        gameTitle.textContent = '🧠 Memory Match';
        gameTitle.style.textAlign = 'center';
        gameTitle.style.margin = '0.5rem 0';
        gameTitle.style.color = '#5d4037';
        gameTitle.style.fontSize = '1.2rem';
        gameTitle.style.flexShrink = '0';
        
        // Contenedor del grid que se expande
        const gridWrapper = document.createElement('div');
        gridWrapper.style.flex = '1';
        gridWrapper.style.minHeight = '0';
        gridWrapper.style.display = 'flex';
        gridWrapper.style.flexDirection = 'column';
        gridWrapper.style.overflow = 'hidden';
        
        // Crear grid de cartas
        const gridContainer = document.createElement('div');
        gridContainer.className = 'memory-grid';
        gridContainer.id = 'memory-grid';
        gridContainer.style.flex = '1';
        gridContainer.style.minHeight = '0';
        
        // CREAR Y AÑADIR LAS CARTAS AL GRID
        const cards = this.generateCards();
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            gridContainer.appendChild(cardElement);
        });
        
        // Botón de reinicio (fuera del área de scroll)
        const buttonContainer = document.createElement('div');
        buttonContainer.style.flexShrink = '0';
        buttonContainer.style.padding = '0.5rem 0';
        buttonContainer.style.textAlign = 'center';
        
        const resetButton = document.createElement('button');
        resetButton.textContent = '🔄 Restart';
        resetButton.style.padding = '0.5rem 1rem';
        resetButton.style.backgroundColor = '#ffd8a6';
        resetButton.style.color = '#5d4037';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '8px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontSize = '0.9rem';
        resetButton.style.fontWeight = 'bold';
        resetButton.addEventListener('click', () => {
            this.cleanup();
            this.startGameSession();
        });
        
        buttonContainer.appendChild(resetButton);
        
        // Ensamblar todo
        gridWrapper.appendChild(gridContainer);
        
        gameContainer.appendChild(gameTitle);
        gameContainer.appendChild(gridWrapper);
        gameContainer.appendChild(buttonContainer);
        gameScreen.appendChild(gameContainer);
        
        // Configurar grid después de añadirlo al DOM
        setTimeout(() => {
            this.setupGridLayout(gridContainer);
            this.applyCardSizeConstraints();
        }, 50);
        
        // Redimensionar al cambiar tamaño
        window.addEventListener('resize', () => this.handleResize(gridContainer));
        
        // Asegurar que el manejador del header esté configurado
        this.saveOriginalHeaderHandler();
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
        
        // Calcular número óptimo de columnas
        let columns;
        
        // Determinar número de columnas basado en orientación y tamaño
        if (isLandscape) {
            // Horizontal
            if (viewportWidth >= 1600) columns = 8;
            else if (viewportWidth >= 1200) columns = 6;
            else if (viewportWidth >= 768) columns = 5;
            else columns = 4;
        } else {
            // Vertical
            if (viewportWidth >= 1024) columns = 5;
            else if (viewportWidth >= 768) columns = 4;
            else columns = 3; // Móviles
        }
        
        // Asegurar mínimo de columnas
        columns = Math.max(2, columns);
        
        // Ajustar si tenemos pocas cartas
        if (this.gridSize < columns * 2) {
            columns = Math.max(2, Math.floor(this.gridSize / 2));
        }
        
        // Reducir más si es móvil
        if (isMobile && columns > 4) {
            columns = 4;
        }
        
        // Calcular filas necesarias
        const rows = Math.ceil(this.gridSize / columns);
        
        // Configurar grid
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridAutoRows = '1fr';
        
        // Ajustar gap según tamaño
        const gapSize = Math.max(0.125, 0.5 - (columns * 0.1));
        gridContainer.style.gap = `${gapSize}rem`;
        
        // Asegurar que no haya overflow
        gridContainer.style.overflow = 'hidden';
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
    }
    
    applyCardSizeConstraints() {
        const style = document.createElement('style');
        style.id = 'memory-card-dynamic-styles';
        
        const oldStyle = document.getElementById('memory-card-dynamic-styles');
        if (oldStyle) oldStyle.remove();
        
        // Calcular tamaño dinámico
        const viewportWidth = window.innerWidth;
        const isMobile = viewportWidth < 768;
        
        // Obtener configuración actual del grid
        const gridContainer = document.getElementById('memory-grid');
        if (!gridContainer) return;
        
        const computedStyle = getComputedStyle(gridContainer);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        const rows = Math.ceil(this.gridSize / columns);
        
        // Calcular tamaño máximo por carta
        const availableWidth = gridContainer.clientWidth;
        const availableHeight = gridContainer.clientHeight;
        
        // Calcular gaps en píxeles (asumiendo 1rem = 16px)
        const gapHorizontal = (columns - 1) * 4; // 0.25rem en px
        const gapVertical = (rows - 1) * 4;
        
        // Calcular tamaño disponible para cartas
        const cardWidth = Math.floor((availableWidth - gapHorizontal) / columns);
        const cardHeight = Math.floor((availableHeight - gapVertical) / rows);
        
        // Usar la dimensión más pequeña para mantener cuadrado
        const minDimension = Math.min(cardWidth, cardHeight * 0.85); // Factor 0.85 para aspecto
        
        // Limitar tamaño máximo y mínimo
        const finalSize = Math.max(70, Math.min(180, minDimension));
        
        style.textContent = `
            .memory-card {
                max-width: ${finalSize}px !important;
                max-height: ${finalSize * 1.2}px !important;
                min-width: ${Math.min(70, finalSize)}px;
                min-height: ${Math.min(84, finalSize * 1.2)}px;
            }
            
            .memory-chinese-character {
                font-size: ${Math.min(2.5, finalSize / 20)}rem !important;
            }
            
            .memory-pinyin {
                font-size: ${Math.min(1, finalSize / 35)}rem !important;
            }
            
            .card-front div:first-child {
                font-size: ${Math.min(2, finalSize / 25)}rem !important;
            }
        `;
        
        document.head.appendChild(style);
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
        
        // Contenedor interno para efecto 3D
        const innerContainer = document.createElement('div');
        innerContainer.className = 'card-inner';
        
        // Cara frontal (reverso)
        const frontFace = document.createElement('div');
        frontFace.className = 'card-front';
        
        // Diseño para el reverso
        const patternContainer = document.createElement('div');
        patternContainer.style.width = '80%';
        patternContainer.style.height = '80%';
        patternContainer.style.backgroundImage = `radial-gradient(circle, #ffd8a6 2px, transparent 2px)`;
        patternContainer.style.backgroundSize = '20px 20px';
        patternContainer.style.opacity = '0.7';
        patternContainer.style.borderRadius = '6px';
        
        const yulinLogo = document.createElement('div');
        yulinLogo.textContent = '🌳';
        yulinLogo.style.fontSize = '2rem';
        yulinLogo.style.position = 'absolute';
        yulinLogo.style.zIndex = '1';
        
        frontFace.appendChild(patternContainer);
        frontFace.appendChild(yulinLogo);
        
        // Cara trasera (contenido)
        const backFace = document.createElement('div');
        backFace.className = 'card-back';
        backFace
