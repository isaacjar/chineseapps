// game4.js 
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
        this.usedIndices = new Set(); // Para evitar repetir preguntas
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // URL base para las imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Cache para imágenes cargadas
        this.imageCache = new Map();
        
        // Cache para almacenar las opciones actuales
        this.currentOptions = [];
        
        // Cache para índices ya usados
        this.usedIndices = new Set();
    }

    async startGame() {
        // Primero cargar la lista de archivos disponibles
        await this.loadPictureLists();
        
        // Mostrar popup de selección de listado
        this.showPictureListsPopup();
    }

    async loadPictureLists() {
        try {
            const response = await fetch(this.picturesBaseUrl + 'index.js');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scriptContent = await response.text();
            
            // Extraer el array del script
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
            { filename: "animals", title: "Animales", level: "A1", misc: "Basic" },
            { filename: "food", title: "Comida", level: "A1", misc: "Basic" },
            { filename: "objects", title: "Objetos", level: "A1", misc: "Basic" },
            { filename: "nature", title: "Naturaleza", level: "A1", misc: "Basic" }
        ];
    }

    showPictureListsPopup() {
        // Crear popup similar al de listados de vocabulario
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
        title.textContent = 'Selecciona un listado de imágenes';
        title.style.marginBottom = '1.5rem';
        title.style.textAlign = 'center';
        title.style.color = '#5d4037';

        // Contenedor para botones de filtro
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-buttons';
        filterContainer.style.marginBottom = '1rem';
        filterContainer.style.display = 'flex';
        filterContainer.style.flexWrap = 'wrap';
        filterContainer.style.gap = '0.5rem';
        filterContainer.style.justifyContent = 'center';
        
        // Crear botones de filtro
        const levels = ['all', ...new Set(this.availablePictureLists.map(list => list.level))];
        levels.forEach(level => {
            const filterBtn = document.createElement('button');
            filterBtn.className = `filter-btn ${level === 'all' ? 'active' : ''}`;
            filterBtn.textContent = level === 'all' ? 'All' : level;
            filterBtn.dataset.level = level;
            
            filterBtn.style.padding = '0.5rem 1rem';
            filterBtn.style.border = '2px solid var(--pastel-brown-dark)';
            filterBtn.style.borderRadius = '20px';
            filterBtn.style.backgroundColor = level === 'all' ? 'var(--pastel-brown-dark)' : 'var(--pastel-orange)';
            filterBtn.style.color = level === 'all' ? 'white' : '#5d4037';
            filterBtn.style.cursor = 'pointer';
            filterBtn.style.transition = 'var(--transition)';
            filterBtn.style.fontSize = '0.9rem';
            filterBtn.style.fontWeight = 'bold';
            
            filterBtn.addEventListener('click', () => this.filterPictureLists(level, filterBtn));
            filterContainer.appendChild(filterBtn);
        });

        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container';
        listsContainer.style.display = 'flex';
        listsContainer.style.flexDirection = 'column';
        listsContainer.style.gap = '0.5rem';
        listsContainer.style.marginBottom = '1.5rem';
        listsContainer.style.maxHeight = '300px';
        listsContainer.style.overflowY = 'auto';

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
        content.appendChild(filterContainer);
        content.appendChild(listsContainer);
        content.appendChild(closeButton);
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        // Mostrar todos los listados inicialmente
        this.displayFilteredPictureLists(listsContainer, this.availablePictureLists);
    }
    
    filterPictureLists(level, clickedButton) {
        const filteredLists = level === 'all' 
            ? this.availablePictureLists 
            : this.availablePictureLists.filter(list => list.level === level);
        
        // Actualizar estado activo de los botones
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.level === level;
            btn.style.backgroundColor = isActive ? 'var(--pastel-brown-dark)' : 'var(--pastel-orange)';
            btn.style.color = isActive ? 'white' : '#5d4037';
        });
        
        // Actualizar la lista mostrada
        const listsContainer = document.querySelector('.popup-content .lists-container');
        this.displayFilteredPictureLists(listsContainer, filteredLists);
    }
    
    displayFilteredPictureLists(container, lists) {
        container.innerHTML = '';
        
        if (lists.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 1rem; color: #5d4037;">No hay listados para este nivel</p>';
            return;
        }
        
        lists.forEach(list => {
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
                this.ui.showToast(`Cargando "${list.title}"...`, 'info');
                const success = await this.loadPictureList(list.filename);
                if (success) {
                    // Cerrar todos los popups
                    const popup = document.querySelector('.popup-overlay');
                    if (popup) document.body.removeChild(popup);
                    this.startGameSession();
                } else {
                    this.ui.showToast(`Error cargando el listado "${list.title}"`, 'error');
                }
            });

            container.appendChild(button);
        });
    }

    async loadPictureList(filename) {
        try {
            const response = await fetch(`${this.picturesBaseUrl}${filename}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('El listado está vacío o no es un array válido');
            }
            
            // Filtrar palabras que tengan caracteres chinos
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No hay palabras con caracteres chinos en este listado');
            }
            
            // Mezclar el vocabulario para orden aleatorio
            this.shuffleArray(this.vocabulary);
            
            // Limpiar cache e índices usados
            this.imageCache.clear();
            this.usedIndices.clear();
            
            // Precargar las primeras imágenes
            await this.preloadImages();
            
            return true;
            
        } catch (error) {
            console.error('Error cargando listado de imágenes:', error);
            
            // Datos de ejemplo
            this.vocabulary = [
                { ch: "猫", pin: "māo", en: "cat", es: "gato", pic: "cat.png" },
                { ch: "狗", pin: "gǒu", en: "dog", es: "perro", pic: "dog.png" },
                { ch: "苹果", pin: "píngguǒ", en: "apple", es: "manzana", pic: "apple.png" },
                { ch: "书", pin: "shū", en: "book", es: "libro", pic: "book.png" },
                { ch: "水", pin: "shuǐ", en: "water", es: "agua", pic: "water.png" },
                { ch: "树", pin: "shù", en: "tree", es: "árbol", pic: "tree.png" },
                { ch: "花", pin: "huā", en: "flower", es: "flor", pic: "flower.png" },
                { ch: "鸟", pin: "niǎo", en: "bird", es: "pájaro", pic: "bird.png" },
                { ch: "鱼", pin: "yú", en: "fish", es: "pez", pic: "fish.png" },
                { ch: "车", pin: "chē", en: "car", es: "coche", pic: "car.png" }
            ];
            
            // Mezclar datos de ejemplo
            this.shuffleArray(this.vocabulary);
            
            this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            return true;
        }
    }

    async preloadImages() {
        // Precargar imágenes para las primeras palabras
        const wordsToPreload = this.vocabulary.slice(0, Math.min(15, this.vocabulary.length));
        const preloadPromises = wordsToPreload.map(word => this.getImageUrl(word));
        
        await Promise.allSettled(preloadPromises);
    }

    async getImageUrl(word) {
        const cacheKey = word.ch;
        
        // Verificar si ya está en cache
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }
        
        let imageUrl;
        
        // Si la palabra tiene campo "pic", usar esa imagen
        if (word.pic) {
            imageUrl = `${this.picFolderUrl}${word.pic}`;
        } else {
            // Si no tiene campo "pic", usar el carácter chino + .png
            imageUrl = `${this.picFolderUrl}${word.ch}.png`;
        }
        
        // Verificar si la imagen existe
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                this.imageCache.set(cacheKey, imageUrl);
                return imageUrl;
            }
        } catch (error) {
            console.warn(`No se pudo cargar imagen ${imageUrl}:`, error);
        }
        
        // Si no existe, usar placeholder con el carácter chino
        const placeholderUrl = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(word.ch)}`;
        this.imageCache.set(cacheKey, placeholderUrl);
        return placeholderUrl;
    }

    startGameSession() {
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;
        this.missedWords = [];
        this.usedIndices.clear(); // Limpiar índices usados para nueva sesión
     
        this.ui.showScreen('game-screen');
        // Agregar clase específica para Game4
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('game4');
        }
        this.ui.showGameStats();
        this.enableKeyboardControls();
        this.nextQuestion();
    }

    async nextQuestion() {
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
        
        // Seleccionar palabra aleatoria que no se haya usado recientemente
        let randomIndex;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
            randomIndex = Math.floor(Math.random() * this.vocabulary.length);
            attempts++;
            
            if (attempts >= maxAttempts) {
                // Si no encontramos palabra no usada, limpiar usedIndices
                this.usedIndices.clear();
                break;
            }
        } while (this.usedIndices.has(randomIndex));
        
        // Marcar como usada
        this.usedIndices.add(randomIndex);
        
        this.currentWord = this.vocabulary[randomIndex];
        
        if (!this.currentWord.ch) {
            console.warn('Palabra sin caracteres chinos, buscando otra...');
            this.nextQuestion();
            return;
        }
        
        const incorrectOptions = this.getIncorrectOptions(randomIndex);
    
        // Verificar que tenemos suficientes opciones según la dificultad
        const totalOptionsNeeded = this.settings.get('difficulty') === 1 ? 4 : 6; // 2x2 o 3x2
        
        if (incorrectOptions.length < (totalOptionsNeeded - 1)) {
            console.warn(`No hay suficientes opciones para dificultad ${this.settings.get('difficulty')}, buscando otra palabra...`);
            this.usedIndices.delete(randomIndex); // Liberar índice
            this.nextQuestion();
            return;
        }
        
        const allOptions = [this.currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        
        // Guardar las opciones actuales
        this.currentOptions = allOptions;
        
        // Precargar imágenes para todas las opciones
        await this.preloadOptionsImages(allOptions);
        
        this.displayQuestion(this.currentWord);
        await this.displayOptions(allOptions);
        this.startTimer();
    }

    async preloadOptionsImages(options) {
        const imagePromises = options.map(option => this.getImageUrl(option));
        await Promise.allSettled(imagePromises);
    }

   getIncorrectOptions(correctIndex) {
        const difficulty = this.settings.get('difficulty');
        const numOptionsNeeded = difficulty === 1 ? 3 : 5; // 1 correcta + 3/5 incorrectas = 4/6 total
        
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        // Crear lista de palabras candidatas
        const candidateWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && this.vocabulary[i].ch) {
                candidateWords.push({
                    word: this.vocabulary[i],
                    index: i
                });
            }
        }
        
        // Mezclar y seleccionar opciones aleatorias
        this.shuffleArray(candidateWords);
        
        for (let i = 0; i < Math.min(numOptionsNeeded, candidateWords.length); i++) {
            incorrectOptions.push(candidateWords[i].word);
        }
        
        return incorrectOptions;
    }
    
    calculateSimilarity(word1, word2) {
        // Calcular similitud básica (misma longitud, mismos caracteres iniciales)
        let similarity = 0;
        
        if (word1.ch.length === word2.ch.length) similarity += 1;
        if (word1.ch[0] === word2.ch[0]) similarity += 2;
        if (word1.pin && word2.pin && word1.pin[0] === word2.pin[0]) similarity += 1;
        
        return similarity;
    }

    displayQuestion(word) {
        const questionElement = document.getElementById('question-text');
        questionElement.innerHTML = '';
        
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        // Mostrar caracter chino grande
        const chineseElement = document.createElement('div');
        chineseElement.className = `chinese-character ${fontClass}`;
        chineseElement.textContent = word.ch || '';
        chineseElement.style.fontSize = '4rem';
        chineseElement.style.marginBottom = '1rem';
        questionElement.appendChild(chineseElement);
        
        // Mostrar pinyin si está activado en settings
        if (this.settings.get('showPinyin') && word.pin) {
            const pinyinElement = document.createElement('div');
            pinyinElement.className = 'pinyin-text';
            pinyinElement.textContent = word.pin;
            pinyinElement.style.fontSize = '1.8rem';
            pinyinElement.style.color = '#795548';
            pinyinElement.style.marginBottom = '1rem';
            questionElement.appendChild(pinyinElement);
        }
    }

   async displayOptions(options) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const difficulty = this.settings.get('difficulty');
        
        // Determinar el grid según la dificultad
        if (difficulty === 1) {
            // Dificultad 1: 2x2 grid (2 filas, 2 columnas) = 4 opciones
            optionsContainer.style.gridTemplateColumns = '1fr 1fr';
            optionsContainer.style.gridTemplateRows = '1fr 1fr';
            optionsContainer.style.gap = '1rem';
        } else {
            // Dificultad 2: 3x2 grid (2 filas, 3 columnas) = 6 opciones
            optionsContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
            optionsContainer.style.gridTemplateRows = '1fr 1fr';
            optionsContainer.style.gap = '0.8rem';
        }
        
        // Asegurarnos de que tenemos el número correcto de opciones
        const numOptionsNeeded = difficulty === 1 ? 4 : 6;
        if (options.length < numOptionsNeeded) {
            console.warn(`No hay suficientes opciones. Necesitamos ${numOptionsNeeded}, tenemos ${options.length}`);
            // Si faltan opciones, repetir algunas para completar
            while (options.length < numOptionsNeeded) {
                const randomIndex = Math.floor(Math.random() * this.vocabulary.length);
                options.push(this.vocabulary[randomIndex]);
            }
        }
    
        // Crear todos los botones
        const buttonPromises = options.map(async (option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.dataset.index = index;
            button.style.position = 'relative';
            button.style.padding = '0.5rem';
            button.style.display = 'flex';
            button.style.flexDirection = 'column';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.minHeight = '180px';
            button.style.gap = '0.5rem';
            
            // Obtener URL de la imagen (ya debería estar en cache)
            const imageUrl = await this.getImageUrl(option);
            
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = option.ch;
            imgElement.style.width = '160px';
            imgElement.style.height = '160px';
            imgElement.style.objectFit = 'contain';
            imgElement.style.borderRadius = '0';
            imgElement.style.border = 'none'; 
            
            // Mostrar placeholder mientras carga
            imgElement.style.background = 'transparent';
            
            // Agregar loader para placeholders
            imgElement.onload = () => {
                imgElement.style.background = 'none';
            };
            
            imgElement.onerror = () => {
                // Si falla la imagen, mostrar placeholder
                imgElement.src = `https://via.placeholder.com/160.png/ffd8a6/5d4037?text=${encodeURIComponent(option.ch)}`;
                imgElement.style.background = 'var(--pastel-orange)';
                imgElement.style.borderRadius = '12px';
                imgElement.style.padding = '1rem';
            };
            
            button.appendChild(imgElement);
            
            // Agregar número de opción (1-9) solo para dificultad 2
            if (difficulty === 2) {
                const numberElement = document.createElement('div');
                numberElement.textContent = `${index + 1}`;
                numberElement.style.position = 'absolute';
                numberElement.style.top = '5px';
                numberElement.style.left = '5px';
                numberElement.style.backgroundColor = 'var(--pastel-brown-dark)';
                numberElement.style.color = 'white';
                numberElement.style.width = '28px';
                numberElement.style.height = '28px';
                numberElement.style.borderRadius = '50%';
                numberElement.style.display = 'flex';
                numberElement.style.alignItems = 'center';
                numberElement.style.justifyContent = 'center';
                numberElement.style.fontSize = '0.9rem';
                numberElement.style.fontWeight = 'bold';
                numberElement.style.zIndex = '10';
                numberElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                button.appendChild(numberElement);
            }
            
            return { button, option, index };
        });
        
        // Esperar a que se creen todos los botones
        const buttonData = await Promise.all(buttonPromises);
        
        // Agregar event listeners y añadir al DOM
        buttonData.forEach(({ button, option, index }) => {
            button.addEventListener('click', () => {
                this.checkAnswer(option);
            });
            
            optionsContainer.appendChild(button);
        });
    }

    checkAnswer(selectedOption) {
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
            
            // Aplicar clases según el escenario
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
            if (this.ui.soundManager) this.ui.soundManager.play('correct');
        } else {
            this.lives--;
            this.streak = 0;
            if (!this.missedWords.some(word => word.ch === this.currentWord.ch)) {
                this.missedWords.push(this.currentWord);
            }
            if (this.ui.soundManager) this.ui.soundManager.play('wrong');
        }
        
        this.updateGameStats();
        
        setTimeout(() => {
            if (this.lives <= 0) {
                this.endGame();
            } else {
                this.nextQuestion();
            }
        }, 1500);
    }

    startTimer() {
        this.timeLeft = this.settings.get('time');
        const timerProgress = document.getElementById('timer-progress');
        
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
    }
    
    updateGameStats() {
        document.getElementById('question-progress').textContent = `🌱 ${this.currentQuestion}/${this.settings.get('questions')}`;
        document.getElementById('score').textContent = `🏅 ${this.score}`;
        document.getElementById('streak').textContent = `🔥 ${this.streak}`;
        document.getElementById('lives').textContent = `❤️ ${this.lives}`;
    }
    
    endGame() {
        this.stats.recordGame();
        clearTimeout(this.timer);
        this.timer = null;

        this.disableKeyboardControls();

        // Remover clase específica de Game4
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('game4');
        }
        
        const missedWords = this.getMissedWords();
     
        // Mostrar popup de resultados
        this.ui.showGameResults(
            this.score, 
            this.settings.get('questions'),
            missedWords,
            this.currentGame,
            () => {
                // Callback para jugar otra vez
                this.startGameSession();
            }
        );
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Método para manejar eventos de teclado
    handleKeyPress(event) {
        // Solo procesar si estamos en pantalla de juego
        if (!document.getElementById('game-screen').classList.contains('active')) {
            return;
        }
        
        const key = event.key;
        
        // Verificar si es un número del 1 al 9
        if (/^[1-9]$/.test(key)) {
            const optionIndex = parseInt(key) - 1; // Convertir a índice (0-based)
            const options = document.querySelectorAll('.option-btn:not(:disabled)');
            
            // Verificar que el índice es válido
            if (optionIndex < options.length) {
                // Encontrar la opción correspondiente
                const optionButton = Array.from(options).find(btn => 
                    parseInt(btn.dataset.index) === optionIndex
                );
                
                if (optionButton) {
                    const option = this.currentOptions[optionIndex];
                    this.checkAnswer(option);
                }
            }
        }
    }
    
    // Método para agregar event listener del teclado
    enableKeyboardControls() {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    
    // Método para remover event listener del teclado
    disableKeyboardControls() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    getMissedWords() {
        return this.missedWords;
    }
}
