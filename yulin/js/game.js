class Game {
    constructor(settings, stats, ui) {
        this.settings = settings;
        this.stats = stats;
        this.ui = ui;
        this.currentGame = null;
        this.vocabulary = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.currentWord = null;
        this.missedWords = [];

        // Bind para manejar eventos de teclado
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Datos de ejemplo para testing con nuevo formato
        this.sampleVocabulary = [
            { ch: "你好", pin: "nǐ hǎo", en: "hello", es: "hola" },
            { ch: "谢谢", pin: "xièxie", en: "thank you", es: "gracias" },
            { ch: "小", pin: "xiǎo", en: "small", es: "pequeño" }
        ];
    }
    
    async loadVocabularyList(filename) {
        if (!filename) {
            console.error('No se proporcionó nombre de archivo');
            return false;
        }
        
        try {
            console.log('Cargando listado:', filename);
            const response = await fetch(`https://isaacjar.github.io/chineseapps/voclists/${filename}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('El listado está vacío o no es un array válido');
            }
            
            // Verificar que cada elemento tenga al menos 'en' o 'es'
            const isValid = data.every(item => 
                item && typeof item === 'object' && 
                ('en' in item || 'es' in item)
            );
            
            if (!isValid) {
                throw new Error('El formato del listado no es válido - necesita al menos "en" o "es"');
            }
            
            this.vocabulary = data;
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras`);
            console.log('Primeras palabras:', this.vocabulary.slice(0, 3));
            return true;
            
        } catch (error) {
            console.error('Error cargando vocabulario:', error);
            console.log('Usando vocabulario de ejemplo');
            
            // Usar datos de ejemplo si falla la carga
            this.vocabulary = this.sampleVocabulary;
            
            // Mostrar advertencia al usuario
            if (this.ui) {
                this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            }
            
            return true; // Devolver true para permitir continuar con datos de ejemplo
        }
    } 
    
    startGame(gameType) {
        if (!this.vocabulary.length) {
            this.ui.showToast('Primero selecciona un listado de vocabulario', 'error');
            this.ui.showScreen('lists-screen');
            return;
        }
        
        this.currentGame = gameType;
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;

        this.missedWords = [];
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
        // Habilitar controles de teclado
        this.enableKeyboardControls();
        this.nextQuestion();
    }
    
    nextQuestion() {
        // Limpiar timer anterior si existe
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        // Resetear barra de tiempo visualmente
        const timerProgress = document.getElementById('timer-progress');
        if (timerProgress) {
            // Remover transición temporalmente para el reset instantáneo
            timerProgress.style.transition = 'none';
            timerProgress.style.width = '100%';
            
            // Forzar reflow para aplicar el cambio inmediatamente
            timerProgress.offsetHeight;
            
            // Restaurar la transición para la siguiente animación
            timerProgress.style.transition = `width ${this.settings.get('time')}s linear`;
        }
            
        if (this.currentQuestion >= this.settings.get('questions')) {
            this.endGame();
            return;
        }
        
        this.currentQuestion++;
        this.updateGameStats();
        
        // Seleccionar palabra actual y opciones
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        this.currentWord = this.vocabulary[currentIndex];
        
        // Seleccionar opciones incorrectas
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        // Mezclar opciones
        const allOptions = [this.currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        
        // Mostrar pregunta y opciones
        this.displayQuestion(this.currentWord);
        this.displayOptions(allOptions, this.currentWord);
        
        // Iniciar temporizador
        this.startTimer();
    }
    
    getIncorrectOptions(correctIndex) {
        const numOptions = this.settings.get('difficulty') === 1 ? 3 : 5;
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        while (incorrectOptions.length < numOptions) {
            const randomIndex = Math.floor(Math.random() * this.vocabulary.length);
            if (!usedIndices.has(randomIndex)) {
                incorrectOptions.push(this.vocabulary[randomIndex]);
                usedIndices.add(randomIndex);
            }
        }
        
        return incorrectOptions;
    }
    
    displayQuestion(word) {
        const questionElement = document.getElementById('question-text');
        questionElement.innerHTML = ''; // Limpiar contenido anterior
        // Aplicar clase de fuente
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        if (this.currentGame === 'game1') {
            // JUEGO 1: Mostrar palabra en chino (grande)
            const chineseElement = document.createElement('div');
            chineseElement.className = `chinese-character ${fontClass}`;
            chineseElement.textContent = word.ch || '';
            questionElement.appendChild(chineseElement);
            
            // Mostrar pinyin si está activado en settings
            if (this.settings.get('showPinyin') && word.pin) {
                const pinyinElement = document.createElement('div');
                pinyinElement.className = 'pinyin-text';
                pinyinElement.textContent = word.pin;
                questionElement.appendChild(pinyinElement);
            }
        } else {
            // JUEGO 2: Mostrar palabra en el idioma configurado
            const lang = this.settings.get('language');
            let questionText;
            if (lang === 'es' && word.es) {
                questionText = word.es;
            } else {
                questionText = word.en;
            }
            
            const textElement = document.createElement('div');
            textElement.className = 'translation-text';
            textElement.textContent = questionText;
            questionElement.appendChild(textElement);
        }
    }
    
    displayOptions(options, correctWord) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Ajustar grid según dificultad
        const difficulty = this.settings.get('difficulty');
        if (window.innerHeight > window.innerWidth) {
            // Móvil: siempre 2 columnas
            optionsContainer.style.gridTemplateColumns = '1fr 1fr';
        } else {
            // Escritorio: ajustar según dificultad
            optionsContainer.style.gridTemplateColumns = difficulty === 1 ? '1fr 1fr' : '1fr 1fr 1fr';
        }

        // Obtener la fuente configurada
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            if (this.currentGame === 'game1') {
                // JUEGO 1: Opciones en el idioma configurado
                const lang = this.settings.get('language');
                let optionText;
                if (lang === 'es' && option.es) {
                    optionText = option.es;
                } else {
                    optionText = option.en;
                }
                button.textContent = optionText;
            } else {
                // JUEGO 2: Opciones en chino
                const chineseElement = document.createElement('div');
                chineseElement.className = `option-chinese ${fontClass}`;
                chineseElement.textContent = option.ch || '';
                
                // Mostrar pinyin si está activado
                if (this.settings.get('showPinyin') && option.pin) {
                    const pinyinElement = document.createElement('div');
                    pinyinElement.className = 'option-pinyin';
                    pinyinElement.textContent = option.pin;
                    button.appendChild(chineseElement);
                    button.appendChild(pinyinElement);
                } else {
                    button.appendChild(chineseElement);
                }
            }
            
            button.addEventListener('click', () => this.checkAnswer(option, correctWord));
            optionsContainer.appendChild(button);
        });
    }
    
    checkAnswer(selectedOption, correctWord) {
        // Limpiar timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const isCorrect = selectedOption === correctWord;
        this.stats.recordAnswer(isCorrect);
        
        // Mostrar feedback visual
        const options = document.querySelectorAll('.option-btn');
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        options.forEach(btn => {
            let isThisCorrectOption = false;
            let isThisSelectedOption = false;
            
            if (this.currentGame === 'game1') {
                // Juego 1: Comparar por contenido del idioma seleccionado
                const btnText = btn.textContent;
                const lang = this.settings.get('language');
                let correctText;
                if (lang === 'es' && correctWord.es) {
                    correctText = correctWord.es;
                } else {
                    correctText = correctWord.en;
                }
                isThisCorrectOption = btnText === correctText;
                
                // Verificar si es la opción seleccionada
                const selectedText = this.currentGame === 'game1' ? 
                    (this.settings.get('language') === 'es' && selectedOption.es ? selectedOption.es : selectedOption.en) :
                    selectedOption.ch;
                isThisSelectedOption = btnText === selectedText;
            } else {
                // Juego 2: Comparar por caracter chino
                const chineseElement = btn.querySelector('.option-chinese');
                const btnChinese = chineseElement ? chineseElement.textContent : btn.textContent;
                const correctChinese = correctWord.ch || '';
                isThisCorrectOption = btnChinese === correctChinese;
                
                // Verificar si es la opción seleccionada
                const selectedChinese = selectedOption.ch || '';
                isThisSelectedOption = btnChinese === selectedChinese;

                // Aplicar clase de fuente si no la tiene
                if (chineseElement && !chineseElement.classList.contains(fontClass)) {
                    chineseElement.classList.add(fontClass);
                }
            }
            
            // Aplicar clases según el escenario
            if (isThisCorrectOption) {
                btn.classList.add('correct');
            } else if (isThisSelectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });
        
        // Mostrar mensaje toast
        if (isCorrect) {
            this.score++;
            this.streak++;
            this.ui.showRandomSuccessMessage();
        } else {
            this.lives--;
            this.streak = 0;
            if (!this.missedWords.some(word => word.ch === correctWord.ch)) { this.missedWords.push(correctWord); } // Logica guardar palabras falladas
            this.ui.showRandomFailMessage();
        }
        
        this.updateGameStats();
        
        // Siguiente pregunta después de un breve delay
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
        
        // Asegurar que la transición esté configurada correctamente
        timerProgress.style.transition = `width ${this.timeLeft}s linear`;
        timerProgress.style.width = '100%';
        
         // Pequeño delay para asegurar que el reset se aplicó
        setTimeout(() => {
            timerProgress.style.width = '0%';
        }, 50);
        
        this.timer = setTimeout(() => {
            // Tiempo agotado - mostrar respuesta correcta
            const options = document.querySelectorAll('.option-btn');
            options.forEach(btn => {
                let isThisCorrectOption = false;
                
                if (this.currentGame === 'game1') {
                    // Juego 1: Comparar por contenido del idioma seleccionado
                    const btnText = btn.textContent;
                    const lang = this.settings.get('language');
                    let correctText;
                    if (lang === 'es' && this.currentWord.es) {
                        correctText = this.currentWord.es;
                    } else {
                        correctText = this.currentWord.en;
                    }
                    isThisCorrectOption = btnText === correctText;
                } else {
                    // Juego 2: Comparar por caracter chino
                    const chineseElement = btn.querySelector('.option-chinese');
                    const btnChinese = chineseElement ? chineseElement.textContent : btn.textContent;
                    const correctChinese = this.currentWord.ch || '';
                    isThisCorrectOption = btnChinese === correctChinese;
                }
                
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
            
            // Siguiente pregunta después de mostrar la respuesta correcta
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
        this.timer = null; // Limpiar referencia al timer

        // Deshabilitar controles de teclado
        this.disableKeyboardControls();
        
        // Obtener palabras falladas 
        const missedWords = this.getMissedWords();
        
        // Mostrar popup de resultados en lugar del toast
        this.ui.showGameResults(
            this.score, 
            this.settings.get('questions'),
            missedWords,
            this.currentGame,
            () => {
                // Callback para jugar otra vez
                this.startGame(this.currentGame);
            }
        );
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
    
    // Método get Palabras Falladas
    getMissedWords() {
        return this.missedWords;
    }
}
