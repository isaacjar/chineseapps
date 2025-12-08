// game4.js - VERSIÓN COMPLETA CON CSS
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
        
        // Caches
        this.imageCache = new Map();
        this.imageAvailabilityCache = new Map();
        
        // Opciones actuales
        this.currentOptions = [];
        
        // Para evitar repetición de imágenes
        this.recentlyUsedImages = new Set();
        this.maxRecentImages = 15;
        
        // Estilos CSS que se añadirán dinámicamente
        this.addGame4Styles();
    }

    // ============ MÉTODOS DE ESTILOS ============
    
    addGame4Styles() {
        // Verificar si los estilos ya están añadidos
        if (document.getElementById('game4-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'game4-styles';
        style.textContent = `
            .game4-image {
                width: 128px;
                height: 128px;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid var(--pastel-brown);
                background: var(--pastel-orange);
                transition: all 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .game4-image {
                    width: 100px;
                    height: 100px;
                }
            }
            
            @media (max-width: 480px) {
                .game4-image {
                    width: 80px;
                    height: 80px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============ MÉTODOS PRINCIPALES ============
    
    startGame = async () => {
        this.recentlyUsedImages.clear();
        await this.loadPictureLists();
        setTimeout(() => this.showPictureListsPopup(), 0);
    };

    loadPictureLists = async () => {
        try {
            const response = await fetch(this.picturesBaseUrl + 'index.js');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const scriptContent = await response.text();
            const match = scriptContent.match(/const vocpiclists\s*=\s*(\[.*?\]);/s);
            
            if (match && match[1]) {
                try {
                    this.availablePictureLists = eval(`(${match[1]})`);
                } catch (e) {
                    this.useFallbackPictureLists();
                }
            } else {
                this.useFallbackPictureLists();
            }
        } catch (error) {
            this.useFallbackPictureLists();
        }
    };

    useFallbackPictureLists = () => {
        this.availablePictureLists = [
            { filename: "animals", title: "Animales", level: "A1", misc: "Basic" },
            { filename: "food", title: "Comida", level: "A1", misc: "Basic" },
            { filename: "objects", title: "Objetos", level: "A1", misc: "Basic" }
        ];
    };

    showPictureListsPopup = () => {
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; justify-content: center;
            align-items: center; z-index: 1000;
        `;

        const content = document.createElement('div');
        content.className = 'popup-content';
        content.style.cssText = `
            background: white; padding: 2rem; border-radius: 12px;
            max-width: 90%; max-height: 80%; overflow-y: auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        const title = document.createElement('h2');
        title.textContent = 'Selecciona un Listado';
        title.style.cssText = 'margin-bottom: 1.5rem; text-align: center; color: #5d4037;';

        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container';
        listsContainer.style.cssText = `
            display: flex; flex-direction: column; gap: 0.5rem;
            margin-bottom: 1.5rem; max-height: 400px; overflow-y: auto;
        `;

        if (this.availablePictureLists.length === 0) {
            listsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #5d4037;">No hay listados disponibles</p>';
        } else {
            this.availablePictureLists.forEach(list => {
                const button = document.createElement('button');
                button.className = 'vocab-list-btn';
                button.textContent = `${list.title} (${list.level})`;
                button.style.cssText = `
                    padding: 1rem; background: var(--pastel-orange);
                    border: none; border-radius: 8px; cursor: pointer;
                    transition: var(--transition); text-align: left;
                    font-size: 1rem; color: #5d4037;
                `;

                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = 'var(--pastel-orange-dark)';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = 'var(--pastel-orange)';
                });

                button.addEventListener('click', async () => {
                    this.ui.showToast(`Cargando "${list.title}"...`, 'info');
                    
                    const success = await this.loadPictureList(list.filename);
                    if (success) {
                        document.body.removeChild(popup);
                        setTimeout(() => {
                            this.startGameSession();
                        }, 100);
                    }
                });

                listsContainer.appendChild(button);
            });
        }

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.className = 'btn';
        closeButton.style.cssText = `
            padding: 0.5rem 1rem; background: var(--pastel-green);
            border: none; border-radius: 8px; cursor: pointer;
            margin: 0 auto; display: block;
        `;

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
            const url = `${this.picturesBaseUrl}${filename}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Listado vacío');
            
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            if (this.vocabulary.length === 0) throw new Error('No hay palabras con caracteres chinos');
            
            this.imageCache.clear();
            this.imageAvailabilityCache.clear();
            this.recentlyUsedImages.clear();
            
            await this.prefetchImages();
            return true;
            
        } catch (error) {
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
            { ch: "水", pin: "shuǐ", en: "water", es: "agua", pic: "water.png" },
            { ch: "鸟", pin: "niǎo", en: "bird", es: "pájaro", pic: "bird.png" },
            { ch: "花", pin: "huā", en: "flower", es: "flor", pic: "flower.png" },
            { ch: "车", pin: "chē", en: "car", es: "coche", pic: "car.png" },
            { ch: "房子", pin: "fángzi", en: "house", es: "casa", pic: "house.png" },
            { ch: "树", pin: "shù", en: "tree", es: "árbol", pic: "tree.png" }
        ];
    };

    prefetchImages = async () => {
        const toPrefetch = this.vocabulary.slice(0, 6);
        const prefetchPromises = toPrefetch.map(word => 
            this.getImageUrl(word).catch(() => null)
        );
        await Promise.allSettled(prefetchPromises);
    };

    getImageUrl = async (word) => {
        const cacheKey = word.ch;
        if (this.imageCache.has(cacheKey)) return this.imageCache.get(cacheKey);
        
        let imageUrl = word.pic ? 
            `${this.picFolderUrl}${word.pic}` : 
            `${this.picFolderUrl}${word.ch}.png`;
        
        const exists = await this.checkImageExists(imageUrl);
        const finalUrl = exists ? imageUrl : this.getPlaceholderUrl(word);
        
        this.imageCache.set(cacheKey, finalUrl);
        return finalUrl;
    };

    checkImageExists = async (url) => {
        if (this.imageAvailabilityCache.has(url)) return this.imageAvailabilityCache.get(url);
        
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
        
        // Reset timer
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
        
        // Seleccionar palabra aleatoria no reciente
        let candidateIndex;
        let attempts = 0;
        
        do {
            candidateIndex = Math.floor(Math.random() * this.vocabulary.length);
            attempts++;
            if (attempts >= 20) break;
        } while (this.recentlyUsedImages.has(this.vocabulary[candidateIndex].ch));
        
        this.currentWord = this.vocabulary[candidateIndex];
        this.recentlyUsedImages.add(this.currentWord.ch);
        
        // Limitar imágenes recientes
        if (this.recentlyUsedImages.size > this.maxRecentImages) {
            const firstItem = this.recentlyUsedImages.values().next().value;
            this.recentlyUsedImages.delete(firstItem);
        }
        
        // Obtener opciones incorrectas aleatorias
        const incorrectOptions = this.getRandomIncorrectOptions(candidateIndex);
        const requiredOptions = this.settings.get('difficulty') === 1 ? 3 : 5;
        
        if (incorrectOptions.length < requiredOptions) {
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

    getRandomIncorrectOptions = (correctIndex) => {
        const difficulty = this.settings.get('difficulty');
        const numOptions = difficulty === 1 ? 3 : 5;
        
        const availableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && this.vocabulary[i].ch) {
                availableWords.push({ word: this.vocabulary[i], index: i });
            }
        }
        
        this.shuffleArray(availableWords);
        
        const selectedWords = [];
        const selectedIndices = new Set();
        
        // Primero intentar con palabras no recientes
        for (let i = 0; i < availableWords.length && selectedWords.length < numOptions; i++) {
            const candidate = availableWords[i];
            if (!this.recentlyUsedImages.has(candidate.word.ch)) {
                selectedWords.push(candidate.word);
                selectedIndices.add(candidate.index);
            }
        }
        
        // Si no hay suficientes, usar cualquier
        if (selectedWords.length < numOptions) {
            for (let i = 0; i < availableWords.length && selectedWords.length < numOptions; i++) {
                const candidate = availableWords[i];
                if (!selectedIndices.has(candidate.index)) {
                    selectedWords.push(candidate.word);
                }
            }
        }
        
        return selectedWords;
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
        chineseElement.style.cssText = 'font-size: 4rem; margin-bottom: 1rem;';
        questionElement.appendChild(chineseElement);
        
        if (this.settings.get('showPinyin') && word.pin) {
            const pinyinElement = document.createElement('div');
            pinyinElement.className = 'pinyin-text';
            pinyinElement.textContent = word.pin;
            pinyinElement.style.cssText = 'font-size: 1.8rem; color: #795548; margin-bottom: 1rem;';
            questionElement.appendChild(pinyinElement);
        }
    };

    displayOptions = async (options) => {
        const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;
        
        optionsContainer.innerHTML = '';
        
        // Aplicar clase específica para imágenes
        optionsContainer.className = 'options-container picture-mode';
        optionsContainer.setAttribute('data-difficulty', this.settings.get('difficulty'));
        
        const difficulty = this.settings.get('difficulty');
        const isMobile = window.innerHeight > window.innerWidth;
        let columns;
        
        if (isMobile) {
            columns = 2;
        } else {
            columns = difficulty === 1 ? 2 : 3;
        }
        
        optionsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        optionsContainer.style.gap = '1rem';
        optionsContainer.style.padding = '1rem';
        
        for (const option of options) {
            const button = document.createElement('button');
            button.className = 'option-btn picture-option';
            button.dataset.word = option.ch;
            
            // Aplicar estilos CSS correctos
            button.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0.5rem;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 8px;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `;
            
            const imageUrl = await this.getImageUrl(option);
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = option.ch;
            img.className = 'game4-image';
            img.loading = 'lazy';
            
            img.onerror = () => {
                img.src = this.getPlaceholderUrl(option);
                img.style.background = 'none';
            };
            
            img.onload = () => {
                img.style.background = 'none';
            };
            
            button.appendChild(img);
            button.addEventListener('click', () => this.checkAnswer(option));
            
            optionsContainer.appendChild(button);
        }
    };

    checkAnswer = (selectedOption) => {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const isCorrect = selectedOption === this.currentWord;
        this.stats.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.picture-option');
        
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
            const options = document.querySelectorAll('.picture-option');
            
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

    handleKeyPress = (event) => {
        if (!document.getElementById('game-screen')?.classList.contains('active')) return;
        
        const key = event.key;
        if (/^[1-9]$/.test(key)) {
            const optionIndex = parseInt(key) - 1;
            const options = document.querySelectorAll('.picture-option:not(:disabled)');
            
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
