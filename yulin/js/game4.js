// game4.js - VERSIÓN COMPLETA CORREGIDA
class Game4 {
    constructor(settings, stats, ui) {
        this.settings = settings;
        this.stats = stats;
        this.ui = ui;
        this.currentGame = 'game4';
        this.vocabulary = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.currentWord = null;
        this.missedWords = [];
        
        // URLs para imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Caches mejorados
        this.imageCache = new Map();
        this.imageAvailabilityCache = new Map();
        
        // Opciones actuales
        this.currentOptions = [];
        
        // Contador para logs
        this.debugCounter = 0;
        this.maxDebugLogs = 5;
        
        // NO necesitamos bind si usamos arrow functions para los métodos
    }

    // ============ MÉTODOS PRINCIPALES (arrow functions para mantener contexto) ============
    
    startGame = async () => {
        console.log('Game4: startGame llamado');
        this.debugCounter = 0;
        
        await this.loadPictureLists();
        
        // Usar setTimeout para evitar problemas de contexto
        setTimeout(() => {
            this.showPictureListsPopup();
        }, 0);
    };

    loadPictureLists = async () => {
        try {
            console.log('Game4: Cargando listado de archivos...');
            const response = await fetch(this.picturesBaseUrl + 'index.js');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scriptContent = await response.text();
            const match = scriptContent.match(/const vocpiclists\s*=\s*(\[.*?\]);/s);
            
            if (match && match[1]) {
                try {
                    this.availablePictureLists = eval(`(${match[1]})`);
                    console.log(`Game4: ${this.availablePictureLists.length} listados cargados`);
                } catch (e) {
                    console.error('Error parseando listados:', e);
                    this.useFallbackPictureLists();
                }
            } else {
                this.useFallbackPictureLists();
            }
        } catch (error) {
            console.error('Error cargando listados:', error);
            this.useFallbackPictureLists();
        }
    };

    useFallbackPictureLists = () => {
        this.availablePictureLists = [
            { filename: "animals", title: "Animales", level: "A1", misc: "Basic" },
            { filename: "food", title: "Comida", level: "A1", misc: "Basic" },
            { filename: "objects", title: "Objetos", level: "A1", misc: "Basic" },
            { filename: "nature", title: "Naturaleza", level: "A1", misc: "Basic" }
        ];
        console.log('Game4: Usando listados de ejemplo');
    };

    showPictureListsPopup = () => {
        console.log('Game4: Mostrando popup de listados');
        
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
        content.style.maxHeight = '80%';
        content.style.overflowY = 'auto';
        content.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

        const title = document.createElement('h2');
        title.textContent = 'Selecciona un Listado';
        title.style.marginBottom = '1.5rem';
        title.style.textAlign = 'center';
        title.style.color = '#5d4037';

        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container';
        listsContainer.style.display = 'flex';
        listsContainer.style.flexDirection = 'column';
        listsContainer.style.gap = '0.5rem';
        listsContainer.style.marginBottom = '1.5rem';
        listsContainer.style.maxHeight = '400px';
        listsContainer.style.overflowY = 'auto';

        if (this.availablePictureLists.length === 0) {
            listsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #5d4037;">No hay listados disponibles</p>';
        } else {
            this.availablePictureLists.forEach(list => {
                const button = document.createElement('button');
                button.className = 'vocab-list-btn';
                button.textContent = `${list.title} (${list.level})`;
                button.style.padding = '1rem';
                button.style.backgroundColor = 'var(--pastel-orange)';
                button.style.border = 'none';
                button.style.borderRadius = '8px';
                button.style.cursor = 'pointer';
                button.style.transition = 'var(--transition)';
                button.style.textAlign = 'left';
                button.style.fontSize = '1rem';
                button.style.color = '#5d4037';

                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = 'var(--pastel-orange-dark)';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = 'var(--pastel-orange)';
                });

                button.addEventListener('click', async () => {
                    console.log(`Game4: Seleccionado ${list.filename}`);
                    this.ui.showToast(`Cargando "${list.title}"...`, 'info');
                    
                    const success = await this.loadPictureList(list.filename);
                    if (success) {
                        document.body.removeChild(popup);
                        setTimeout(() => {
                            this.startGameSession();
                        }, 100);
                    } else {
                        this.ui.showToast(`Error cargando el listado "${list.title}"`, 'error');
                    }
                });

                listsContainer.appendChild(button);
            });
        }

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.className = 'btn';
        closeButton.style.padding = '0.5rem 1rem';
        closeButton.style.backgroundColor = 'var(--pastel-green)';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '8px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.margin = '0 auto';
        closeButton.style.display = 'block';

        closeButton.addEventListener('click', () => {
            document.body.removeChild(popup);
            this.ui.showScreen('menu-screen');
        });

        content.appendChild(title);
        content.appendChild(listsContainer);
        content.appendChild(closeButton);
        popup.appendChild(content);
        document.body.appendChild(popup);
    };

    loadPictureList = async (filename) => {
        try {
            console.log(`Game4: Cargando listado ${filename}`);
            
            // Asegurar extensión .json
            const url = `${this.picturesBaseUrl}${filename}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Listado vacío o inválido');
            }
            
            // Filtrar palabras con caracteres chinos
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No hay palabras con caracteres chinos');
            }
            
            console.log(`Game4: ${this.vocabulary.length} palabras cargadas`);
            
            // Limpiar caches
            this.imageCache.clear();
            this.imageAvailabilityCache.clear();
            
            // Precargar imágenes
            await this.prefetchImages();
            
            return true;
            
        } catch (error) {
            console.error('Game4: Error cargando listado:', error);
            
            // Datos de ejemplo
            this.vocabulary = this.getFallbackVocabulary();
            this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            return true;
        }
    };

    getFallbackVocabulary = () => {
        return [
            { ch: "猫", pin: "māo", en: "cat", es: "gato", pic: "cat.png" },
            { ch: "狗", pin: "gǒu", en: "dog", es: "perro", pic: "dog.png" },
            { ch: "苹果", pin: "píngguǒ", en: "apple", es: "manzana", pic: "apple.png" },
            { ch: "书", pin: "shū", en: "book", es: "libro", pic: "book.png" },
            { ch: "水", pin: "shuǐ", en: "water", es: "agua", pic: "water.png" }
        ];
    };

    prefetchImages = async () => {
        // Precargar las primeras 5 imágenes
        const toPrefetch = this.vocabulary.slice(0, 5);
        
        console.log(`Game4: Precargando ${toPrefetch.length} imágenes`);
        
        const prefetchPromises = toPrefetch.map(word => 
            this.getImageUrl(word).catch(() => null)
        );
        
        await Promise.allSettled(prefetchPromises);
        console.log('Game4: Precarga de imágenes completada');
    };

    getImageUrl = async (word) => {
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
        
        // Verificar si la imagen existe
        const exists = await this.checkImageExists(imageUrl);
        
        const finalUrl = exists ? imageUrl : this.getPlaceholderUrl(word);
        
        this.imageCache.set(cacheKey, finalUrl);
        return finalUrl;
    };

    checkImageExists = async (url) => {
        if (this.imageAvailabilityCache.has(url)) {
            return this.imageAvailabilityCache.get(url);
        }
        
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const exists = response.ok;
            this.imageAvailabilityCache.set(url, exists);
            return exists;
        } catch (error) {
            this.imageAvailabilityCache.set(url, false);
            return false;
        }
    };

    getPlaceholderUrl = (word) => {
        const text = word.ch.length > 1 ? word.ch.substring(0, 2) : word.ch;
        return `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(text)}`;
    };

    startGameSession = () => {
        console.log('Game4: Iniciando sesión de juego');
        
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;
        this.missedWords = [];
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
        this.enableKeyboardControls();
        this.nextQuestion();
    };

    nextQuestion = async () => {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const timerProgress = document.getElementById('timer-progress');
        if (timerProgress) {
            timerProgress.style.transition = 'none';
            timerProgress.style.width = '100%';
            timerProgress.offsetHeight;
            timerProgress.style.transition = `width ${this.settings.get('time')}s linear`;
        }
            
        if (this.currentQuestion >= this.settings.get('questions')) {
            this.endGame();
            return;
        }
        
        this.currentQuestion++;
        this.updateGameStats();
        
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        this.currentWord = this.vocabulary[currentIndex];
        
        if (!this.currentWord.ch) {
            setTimeout(() => this.nextQuestion(), 100);
            return;
        }
        
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        if (incorrectOptions.length < (this.settings.get('difficulty') === 1 ? 3 : 5)) {
            setTimeout(() => this.nextQuestion(), 100);
            return;
        }
        
        const allOptions = [this.currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        this.currentOptions = allOptions;
        
        await this.preloadOptionsImages(allOptions);
        
        this.displayQuestion(this.currentWord);
        await this.displayOptions(allOptions);
        this.startTimer();
    };

    getIncorrectOptions = (correctIndex) => {
        const difficulty = this.settings.get('difficulty');
        const numOptions = difficulty === 1 ? 3 : 5;
        
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        const availableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && this.vocabulary[i].ch) {
                availableWords.push({
                    word: this.vocabulary[i],
                    index: i
                });
                if (availableWords.length >= numOptions + 10) break;
            }
        }
        
        this.shuffleArray(availableWords);
        for (let i = 0; i < Math.min(numOptions, availableWords.length); i++) {
            incorrectOptions.push(availableWords[i].word);
        }
        
        return incorrectOptions;
    };

    preloadOptionsImages = async (options) => {
        const imagePromises = options.map(async (option) => {
            const url = await this.getImageUrl(option);
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => resolve(url);
                img.src = url;
            });
        });
        
        await Promise.allSettled(imagePromises);
    };

    displayQuestion = (word) => {
        const questionElement = document.getElementById('question-text');
        if (!questionElement) return;
        
        questionElement.innerHTML = '';
        
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        const chineseElement = document.createElement('div');
        chineseElement.className = `chinese-character ${fontClass}`;
        chineseElement.textContent = word.ch || '';
        chineseElement.style.fontSize = '4rem';
        chineseElement.style.marginBottom = '1rem';
        questionElement.appendChild(chineseElement);
        
        if (this.settings.get('showPinyin') && word.pin) {
            const pinyinElement = document.createElement('div');
            pinyinElement.className = 'pinyin-text';
            pinyinElement.textContent = word.pin;
            pinyinElement.style.fontSize = '1.8rem';
            pinyinElement.style.color = '#795548';
            pinyinElement.style.marginBottom = '1rem';
            questionElement.appendChild(pinyinElement);
        }
    };

    displayOptions = async (options) => {
        const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;
        
        optionsContainer.innerHTML = '';
        
        const difficulty = this.settings.get('difficulty');
        const isMobile = window.innerHeight > window.innerWidth;
        const columns = isMobile ? 2 : (difficulty === 1 ? 2 : 3);
        
        optionsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Mostrar loader temporal
        const loader = document.createElement('div');
        loader.style.gridColumn = `1 / span ${columns}`;
        loader.style.textAlign = 'center';
        loader.style.padding = '2rem';
        loader.innerHTML = '<div style="font-size: 1.5rem; color: #5d4037;">Cargando imágenes...</div>';
        optionsContainer.appendChild(loader);
        
        // Crear botones
        const fragment = document.createDocumentFragment();
        
        for (const option of options) {
            const button = document.createElement('button');
            button.className = 'option-btn picture-option';
            button.dataset.word = option.ch;
            
            const imageUrl = await this.getImageUrl(option);
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = option.ch;
            img.loading = 'lazy';
            img.style.width = '128px';
            img.style.height = '128px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.background = 'var(--pastel-orange)';
            
            img.onerror = () => {
                img.src = this.getPlaceholderUrl(option);
                img.style.background = 'none';
            };
            
            img.onload = () => {
                img.style.background = 'none';
            };
            
            button.appendChild(img);
            button.addEventListener('click', () => this.checkAnswer(option));
            
            fragment.appendChild(button);
        }
        
        // Reemplazar loader con botones
        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(fragment);
    };

    checkAnswer = (selectedOption) => {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const isCorrect = selectedOption === this.currentWord;
        this.stats.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.option-btn');
        
        options.forEach((btn, index) => {
            const optionForThisButton = this.currentOptions[index];
            
            const isThisCorrectOption = optionForThisButton === this.currentWord;
            const isThisSelectedOption = optionForThisButton === selectedOption;
            
            if (isThisCorrectOption) {
                btn.classList.add('correct');
            } else if (isThisSelectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });
        
        if (isCorrect) {
            this.score++;
            this.streak++;
            this.ui.showRandomSuccessMessage();
        } else {
            this.lives--;
            this.streak = 0;
            if (!this.missedWords.some(word => word.ch === this.currentWord.ch)) {
                this.missedWords.push(this.currentWord);
            }
            this.ui.showRandomFailMessage();
        }
        
        this.updateGameStats();
        
        setTimeout(() => {
            if (this.lives <= 0) {
                this.endGame();
            } else {
                this.nextQuestion();
            }
        }, 1500);
    };

    startTimer = () => {
        this.timeLeft = this.settings.get('time');
        const timerProgress = document.getElementById('timer-progress');
        
        if (!timerProgress) return;
        
        timerProgress.style.transition = `width ${this.timeLeft}s linear`;
        timerProgress.style.width = '100%';
        
        setTimeout(() => {
            timerProgress.style.width = '0%';
        }, 50);
        
        this.timer = setTimeout(() => {
            const options = document.querySelectorAll('.option-btn');
            
            options.forEach((btn, index) => {
                const optionForThisButton = this.currentOptions[index];
                const isThisCorrectOption = optionForThisButton === this.currentWord;
                
                if (isThisCorrectOption) {
                    btn.classList.add('correct-answer');
                }
                btn.disabled = true;
            });
            
            this.lives--;
            this.streak = 0;
            this.updateGameStats();
            
            this.ui.showTimeUpMessage();
            
            if (!this.missedWords.some(word => word.ch === this.currentWord.ch)) {
                this.missedWords.push(this.currentWord);
            }
                    
            setTimeout(() => {
                if (this.lives <= 0) {
                    this.endGame();
                } else {
                    this.nextQuestion();
                }
            }, 1500);
        }, this.timeLeft * 1000);
    };
    
    updateGameStats = () => {
        const questionProgress = document.getElementById('question-progress');
        const score = document.getElementById('score');
        const streak = document.getElementById('streak');
        const lives = document.getElementById('lives');
        
        if (questionProgress) questionProgress.textContent = `🌱 ${this.currentQuestion}/${this.settings.get('questions')}`;
        if (score) score.textContent = `🏅 ${this.score}`;
        if (streak) streak.textContent = `🔥 ${this.streak}`;
        if (lives) lives.textContent = `❤️ ${this.lives}`;
    };
    
    endGame = () => {
        this.stats.recordGame();
        clearTimeout(this.timer);
        this.timer = null;
        
        this.disableKeyboardControls();

        const missedWords = this.getMissedWords();
        
        this.ui.showGameResults(
            this.score, 
            this.settings.get('questions'),
            missedWords,
            this.currentGame,
            () => {
                this.startGameSession();
            }
        );
    };

    // ============ MÉTODOS DE TECLADO (necesitan bind o arrow functions) ============
    
    handleKeyPress = (event) => {
        if (!document.getElementById('game-screen')?.classList.contains('active')) {
            return;
        }
        
        const key = event.key;
        if (/^[1-9]$/.test(key)) {
            const optionIndex = parseInt(key) - 1;
            const options = document.querySelectorAll('.option-btn:not(:disabled)');
            
            if (optionIndex < options.length) {
                options[optionIndex].click();
            }
        }
    };
    
    enableKeyboardControls = () => {
        document.addEventListener('keydown', this.handleKeyPress);
    };
    
    disableKeyboardControls = () => {
        document.removeEventListener('keydown', this.handleKeyPress);
    };

    // ============ MÉTODOS REGULARES (no necesitan bind) ============
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getMissedWords() {
        return this.missedWords;
    }
}
