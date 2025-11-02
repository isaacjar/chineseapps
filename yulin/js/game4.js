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
        
        // URL base para las imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Cache para imágenes cargadas
        this.imageCache = new Map();
        
        // Cache para almacenar las opciones actuales
        this.currentOptions = [];
    }

    async startGame() {
        // Primero cargar la lista de archivos disponibles
        await this.loadPictureLists();
        
        // Mostrar popup de selección de listado
        this.showPictureListsPopup();
    }

    async loadPictureLists() {
        try {
            console.log('Cargando listado de archivos de imágenes...');
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
                    console.log('Listados de imágenes cargados:', this.availablePictureLists);
                } catch (e) {
                    console.error('Error parseando listados de imágenes:', e);
                    this.useFallbackPictureLists();
                }
            } else {
                console.warn('No se pudo encontrar el array vocpiclists, usando listados de ejemplo');
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

        const listsContainer = document.createElement('div');
        listsContainer.className = 'lists-container';
        listsContainer.style.display = 'flex';
        listsContainer.style.flexDirection = 'column';
        listsContainer.style.gap = '0.5rem';
        listsContainer.style.marginBottom = '1.5rem';
        listsContainer.style.maxHeight = '400px';
        listsContainer.style.overflowY = 'auto';

        // Crear botones para cada listado
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
                this.ui.showToast(`Cargando "${list.title}"...`, 'info');
                const success = await this.loadPictureList(list.filename);
                if (success) {
                    document.body.removeChild(popup);
                    this.startGameSession();
                } else {
                    this.ui.showToast(`Error cargando el listado "${list.title}"`, 'error');
                }
            });

            listsContainer.appendChild(button);
        });

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
    }

    async loadPictureList(filename) {
        try {
            console.log('Cargando listado de imágenes:', filename);
            const response = await fetch(`${this.picturesBaseUrl}${filename}.json`);
            
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
            
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras con imágenes`);
            
            // Precargar algunas imágenes
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
                { ch: "水", pin: "shuǐ", en: "water", es: "agua", pic: "water.png" }
            ];
            
            this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            return true;
        }
    }

    async preloadImages() {
        // Precargar imágenes para las primeras 10 palabras
        const wordsToPreload = this.vocabulary.slice(0, 10);
        const preloadPromises = wordsToPreload.map(word => this.getImageUrl(word));
        
        await Promise.allSettled(preloadPromises);
        console.log('Precarga de imágenes completada');
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
        
        console.log(`Intentando cargar imagen: ${imageUrl}`);
        
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
        
        // Si no existe, usar placeholder
        const placeholderUrl = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(word.ch.substring(0, 2))}`;
        this.imageCache.set(cacheKey, placeholderUrl);
        return placeholderUrl;
    }

    startGameSession() {
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
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
        
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        this.currentWord = this.vocabulary[currentIndex];
        
        if (!this.currentWord.ch) {
            console.warn('Palabra sin caracteres chinos, buscando otra...');
            this.nextQuestion();
            return;
        }
        
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        if (incorrectOptions.length < (this.settings.get('difficulty') === 1 ? 3 : 5)) {
            console.warn('No hay suficientes opciones, buscando otra palabra...');
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
        const numOptions = difficulty === 1 ? 3 : 5;
        
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        const availableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && !usedIndices.has(i) && this.vocabulary[i].ch) {
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
        
        const instructionElement = document.createElement('div');
        instructionElement.className = 'instruction-text';
        instructionElement.textContent = 'Selecciona la imagen correcta:';
        instructionElement.style.marginTop = '1rem';
        instructionElement.style.fontSize = '1.2rem';
        instructionElement.style.color = '#795548';
        questionElement.appendChild(instructionElement);
    }

    async displayOptions(options) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const difficulty = this.settings.get('difficulty');
        if (window.innerHeight > window.innerWidth) {
            optionsContainer.style.gridTemplateColumns = '1fr 1fr';
        } else {
            optionsContainer.style.gridTemplateColumns = difficulty === 1 ? '1fr 1fr' : '1fr 1fr 1fr';
        }

        for (const option of options) {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.style.padding = '0.5rem';
            button.style.display = 'flex';
            button.style.flexDirection = 'column';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.minHeight = '140px';
            button.style.gap = '0.5rem';
            
            // Obtener URL de la imagen
            const imageUrl = await this.getImageUrl(option);
            
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = option.ch;
            imgElement.style.width = '128px';
            imgElement.style.height = '128px';
            imgElement.style.objectFit = 'cover';
            imgElement.style.borderRadius = '8px';
            imgElement.style.border = '2px solid var(--pastel-brown)';
            
            // Añadir loader mientras carga
            imgElement.style.background = 'var(--pastel-orange)';
            imgElement.onload = () => {
                imgElement.style.background = 'none';
            };
            
            imgElement.onerror = () => {
                // Si falla la imagen, mostrar placeholder
                imgElement.src = `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodeURIComponent(option.ch.substring(0, 2))}`;
                imgElement.style.background = 'none';
            };
            
            button.appendChild(imgElement);
            
            // Pasar el objeto de opción directamente al event listener
            button.addEventListener('click', () => {
                this.checkAnswer(option);
            });
            
            optionsContainer.appendChild(button);
        }
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
            this.ui.showRandomSuccessMessage();
        } else {
            this.lives--;
            this.streak = 0;
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
            this.ui.showToast('⏰ ¡Tiempo agotado!', 'error');
            
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
        
        const message = this.score === this.settings.get('questions') 
            ? '🎉 ¡Perfecto! ¡Has acertado todas!' 
            : `¡Juego terminado! Puntuación: ${this.score}/${this.settings.get('questions')}`;
            
        this.ui.showToast(message, 'info');
        
        setTimeout(() => {
            this.ui.showScreen('menu-screen');
            this.ui.hideGameStats();
        }, 3000);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
