// game4.js - VERSIÓN MEJORADA
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
        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.showPictureListsPopup = this.showPictureListsPopup.bind(this); //  
        this.startGameSession = this.startGameSession.bind(this); //  
        
        // URLs para imágenes
        this.picturesBaseUrl = 'https://isaacjar.github.io/chineseapps/vocpicture/';
        this.picFolderUrl = this.picturesBaseUrl + 'pic/';
        
        // Lista de archivos disponibles
        this.availablePictureLists = [];
        
        // Caches mejorados
        this.imageCache = new Map(); // URL → Promise de imagen cargada
        this.imageAvailabilityCache = new Map(); // URL → boolean (si existe)
        
        // Opciones actuales
        this.currentOptions = [];
        
        // Contador para logs (para evitar spam)
        this.debugCounter = 0;
        this.maxDebugLogs = 5; // Máximo logs por sesión
    }

    debugLog(message, force = false) {
        // Solo mostrar logs en desarrollo o cuando sea forzado
        if (force || (this.debugCounter < this.maxDebugLogs && window.location.hostname.includes('localhost'))) {
            console.log(`[Game4 Debug ${this.debugCounter++}] ${message}`);
        }
    }

    async startGame() {
        // Resetear contador de debug
        this.debugCounter = 0;
        
        // Cargar lista de archivos disponibles
        await this.loadPictureLists();
        
        // Mostrar popup de selección
        setTimeout(() => this.showPictureListsPopup(), 100);
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
        title.textContent = 'Vocabulary Lists';
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

            // USAR ARROW FUNCTION PARA MANTENER EL CONTEXTO
            button.addEventListener('click', async () => {
                this.ui.showToast(`Cargando "${list.title}"...`, 'info');
                const success = await this.loadPictureList(list.filename);
                if (success) {
                    document.body.removeChild(popup);
                    // Usar arrow function aquí también
                    setTimeout(() => this.startGameSession(), 100);
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

        // USAR ARROW FUNCTION AQUÍ TAMBIÉN
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
            this.debugLog(`Cargando listado: ${filename}`);
            
            // Construir URL correcta - IMPORTANTE: Asegúrate de la extensión
            const url = `${this.picturesBaseUrl}${filename}.json`; // ← AÑADIR .json
            
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
            
            this.debugLog(`Listado cargado: ${this.vocabulary.length} palabras`);
            
            // Limpiar caches para nuevo listado
            this.imageCache.clear();
            this.imageAvailabilityCache.clear();
            
            // Precargar imágenes de forma inteligente
            await this.prefetchImages();
            
            return true;
            
        } catch (error) {
            console.error('Error cargando listado:', error);
            
            // Datos de ejemplo
            this.vocabulary = this.getFallbackVocabulary();
            this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            return true;
        }
    }

    useFallbackPictureLists() {
        this.availablePictureLists = [
            { filename: "animals", title: "Animales", level: "A1", misc: "Basic" },
            { filename: "food", title: "Comida", level: "A1", misc: "Basic" },
            { filename: "objects", title: "Objetos", level: "A1", misc: "Basic" }
        ];
        this.debugLog('Usando listados de ejemplo', true);
    }

    async loadPictureList(filename) {
        try {
            this.debugLog(`Cargando listado: ${filename}`);
            const response = await fetch(`${this.picturesBaseUrl}${filename}`);
            
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
            
            this.debugLog(`Listado cargado: ${this.vocabulary.length} palabras`);
            
            // Limpiar caches para nuevo listado
            this.imageCache.clear();
            this.imageAvailabilityCache.clear();
            
            // Precargar imágenes de forma inteligente
            await this.prefetchImages();
            
            return true;
            
        } catch (error) {
            console.error('Error cargando listado:', error);
            
            // Datos de ejemplo
            this.vocabulary = this.getFallbackVocabulary();
            this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            return true;
        }
    }

    getFallbackVocabulary() {
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
    }

    async prefetchImages() {
        // Estrategia mejorada de precarga:
        // 1. Precargar las primeras N imágenes para empezar rápido
        // 2. Precargar el resto en segundo plano
        
        const immediatePrefetch = this.vocabulary.slice(0, 8); // Más que antes
        const backgroundPrefetch = this.vocabulary.slice(8);
        
        // Precarga inmediata (bloqueante)
        this.debugLog(`Precargando ${immediatePrefetch.length} imágenes inmediatamente`);
        const immediatePromises = immediatePrefetch.map(word => 
            this.checkImageAvailability(word).catch(() => false)
        );
        
        await Promise.allSettled(immediatePrefetch);
        this.debugLog('Precarga inmediata completada');
        
        // Precarga en segundo plano (no bloqueante)
        if (backgroundPrefetch.length > 0) {
            setTimeout(async () => {
                this.debugLog(`Precargando ${backgroundPrefetch.length} imágenes en segundo plano`);
                const backgroundPromises = backgroundPrefetch.map(word => 
                    this.checkImageAvailability(word).catch(() => false)
                );
                
                await Promise.allSettled(backgroundPromises);
                this.debugLog('Precarga en segundo plano completada', true);
            }, 1000);
        }
    }

    async checkImageAvailability(word) {
        const url = await this.constructImageUrl(word);
        
        // Verificar cache primero
        if (this.imageAvailabilityCache.has(url)) {
            return this.imageAvailabilityCache.get(url);
        }
        
        try {
            // Usar HEAD request para verificar existencia
            const response = await fetch(url, { 
                method: 'HEAD',
                cache: 'force-cache'
            });
            
            const exists = response.ok;
            this.imageAvailabilityCache.set(url, exists);
            
            if (!exists) {
                this.debugLog(`Imagen no disponible: ${url.substring(url.lastIndexOf('/') + 1)}`);
            }
            
            return exists;
        } catch (error) {
            this.imageAvailabilityCache.set(url, false);
            return false;
        }
    }

    async constructImageUrl(word) {
        // 1. Intentar con el campo 'pic' específico
        if (word.pic) {
            const url = `${this.picFolderUrl}${word.pic}`;
            return url;
        }
        
        // 2. Intentar con el carácter chino + extensión común
        const possibleExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const baseName = word.ch.replace(/[\/\\?%*:|"<>]/g, ''); // Limpiar caracteres inválidos
        
        for (const ext of possibleExtensions) {
            const url = `${this.picFolderUrl}${baseName}${ext}`;
            
            // Verificar cache de disponibilidad
            if (this.imageAvailabilityCache.get(url)) {
                return url;
            }
        }
        
        // 3. Si no se encuentra, usar placeholder
        return this.getPlaceholderUrl(word);
    }

    getPlaceholderUrl(word) {
        // Usar el primer carácter o los primeros dos
        const text = word.ch.length > 1 ? word.ch.substring(0, 2) : word.ch;
        const encodedText = encodeURIComponent(text);
        
        return `https://via.placeholder.com/128.png/ffd8a6/5d4037?text=${encodedText}`;
    }

    async getImageUrl(word) {
        const cacheKey = word.ch;
        
        // Verificar cache
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }
        
        // Construir URL y verificar disponibilidad
        const url = await this.constructImageUrl(word);
        
        // Verificar si realmente existe (si no está en cache)
        const exists = await this.checkImageAvailability(word);
        
        const finalUrl = exists ? url : this.getPlaceholderUrl(word);
        
        // Guardar en cache
        this.imageCache.set(cacheKey, finalUrl);
        
        return finalUrl;
    }

    async preloadOptionsImages(options) {
        // Precargar solo las imágenes necesarias para esta pregunta
        const imagePromises = options.map(async (option) => {
            const url = await this.getImageUrl(option);
            
            // Crear y cargar imagen para precache
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => {
                    resolve(url);
                };
                img.src = url;
            });
        });
        
        await Promise.allSettled(imagePromises);
    }

    async displayOptions(options) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const difficulty = this.settings.get('difficulty');
        const isMobile = window.innerHeight > window.innerWidth;
        const columns = isMobile ? 2 : (difficulty === 1 ? 2 : 3);
        
        optionsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Mostrar loader mientras se cargan las imágenes
        optionsContainer.innerHTML = `
            <div class="loading-overlay" style="grid-column: 1 / span ${columns}; text-align: center; padding: 2rem;">
                <div style="font-size: 1.5rem; color: #5d4037;">Cargando imágenes...</div>
            </div>
        `;
        
        // Crear botones con imágenes
        const fragment = document.createDocumentFragment();
        
        for (const option of options) {
            const button = document.createElement('button');
            button.className = 'option-btn picture-option';
            button.dataset.word = option.ch;
            
            // Obtener URL de la imagen
            const imageUrl = await this.getImageUrl(option);
            
            button.innerHTML = `
                <img src="${imageUrl}" 
                     alt="${option.ch}" 
                     loading="lazy"
                     onerror="this.src='${this.getPlaceholderUrl(option)}'; this.style.background='none'">
            `;
            
            // Configurar el event listener
            button.addEventListener('click', () => {
                this.checkAnswer(option);
            });
            
            fragment.appendChild(button);
        }
        
        // Reemplazar contenido una vez todas las imágenes están listas
        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(fragment);
    }

    startGameSession() {
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;
        this.missedWords = [];
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
        this.enableKeyboardControls();
        this.nextQuestion();
    }

     nextQuestion = async () => {
        // Usar arrow function para mantener el contexto
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
         
        // Reset timer visual
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
        
        // Seleccionar palabra aleatoria
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        this.currentWord = this.vocabulary[currentIndex];
        
        if (!this.currentWord.ch) {
            setTimeout(() => this.nextQuestion(), 100);
            return;
        }
        
        // Obtener opciones incorrectas
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        if (incorrectOptions.length < (this.settings.get('difficulty') === 1 ? 3 : 5)) {
            setTimeout(() => this.nextQuestion(), 100);
            return;
        }
        
        // Mezclar opciones
        const allOptions = [this.currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        this.currentOptions = allOptions;
        
        // Precargar imágenes para esta pregunta
        await this.preloadOptionsImages(allOptions);
        
        // Mostrar pregunta y opciones
        this.displayQuestion(this.currentWord);
        await this.displayOptions(allOptions);
        
        // Iniciar timer
        this.startTimer();
    }

    getIncorrectOptions(correctIndex) {
        const difficulty = this.settings.get('difficulty');
        const numOptions = difficulty === 1 ? 3 : 5;
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        // Buscar palabras disponibles
        const availableIndices = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && this.vocabulary[i].ch) {
                availableIndices.push(i);
            }
        }
        
        // Mezclar índices disponibles
        this.shuffleArray(availableIndices);
        
        // Seleccionar las primeras N
        for (let i = 0; i < Math.min(numOptions, availableIndices.length); i++) {
            incorrectOptions.push(this.vocabulary[availableIndices[i]]);
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
        
    }

    async displayOptions(options) {
         const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;
        
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
            imgElement.style.border = 'none'; 
            
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
            if (!this.missedWords.some(word => word.ch === this.currentWord.ch)) { this.missedWords.push(this.currentWord); } // Guarda la palabra fallada
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
            
            this.ui.showTimeUpMessage();
            
            if (!this.missedWords.some(word => word.ch === this.currentWord.ch)) { this.missedWords.push(this.currentWord); }
                    
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
    
   endGame = () => {
        // Arrow function para mantener contexto
        this.stats.recordGame();
        clearTimeout(this.timer);
        this.timer = null;

        this.disableKeyboardControls();

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
    };
    
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
              options[optionIndex].click(); // Simular click en la opción
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
