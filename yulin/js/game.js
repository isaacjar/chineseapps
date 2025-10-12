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
        
        // Datos de ejemplo para testing
        this.sampleVocabulary = [
            { es: "hola", en: "hello", zh: "你好" },
            { es: "adiós", en: "goodbye", zh: "再见" },
            { es: "gracias", en: "thank you", zh: "谢谢" },
            { es: "por favor", en: "please", zh: "请" },
            { es: "sí", en: "yes", zh: "是" },
            { es: "no", en: "no", zh: "不" },
            { es: "agua", en: "water", zh: "水" },
            { es: "comida", en: "food", zh: "食物" },
            { es: "casa", en: "house", zh: "房子" },
            { es: "familia", en: "family", zh: "家庭" }
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
            
            // Verificar que cada elemento tenga las propiedades necesarias
            const isValid = data.every(item => 
                item && typeof item === 'object' && 
                'es' in item && 'en' in item
            );
            
            if (!isValid) {
                throw new Error('El formato del listado no es válido');
            }
            
            this.vocabulary = data;
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras`);
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
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
        this.nextQuestion();
    }
    
    nextQuestion() {
        if (this.currentQuestion >= this.settings.get('questions')) {
            this.endGame();
            return;
        }
        
        this.currentQuestion++;
        this.updateGameStats();
        
        // Seleccionar palabra actual y opciones
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        const currentWord = this.vocabulary[currentIndex];
        
        // Seleccionar opciones incorrectas
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        // Mezclar opciones
        const allOptions = [currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        
        // Mostrar pregunta y opciones
        this.displayQuestion(currentWord);
        this.displayOptions(allOptions, currentWord);
        
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
        
        if (this.currentGame === 'game1') {
            // Juego 1: Pregunta en español, opciones en el idioma de la app
            questionElement.textContent = word.es;
        } else {
            // Juego 2: Pregunta en el idioma de la app, opciones en español
            const lang = this.settings.get('language');
            questionElement.textContent = word[lang];
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
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            if (this.currentGame === 'game1') {
                // Juego 1: Opciones en el idioma de la app
                const lang = this.settings.get('language');
                button.textContent = option[lang];
            } else {
                // Juego 2: Opciones en español
                button.textContent = option.es;
            }
            
            button.addEventListener('click', () => this.checkAnswer(option, correctWord));
            optionsContainer.appendChild(button);
        });
    }
    
    checkAnswer(selectedOption, correctWord) {
        clearTimeout(this.timer);
        
        const isCorrect = selectedOption === correctWord;
        this.stats.recordAnswer(isCorrect);
        
        // Mostrar feedback visual
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => {
            const btnText = this.currentGame === 'game1' 
                ? btn.textContent === correctWord[this.settings.get('language')]
                : btn.textContent === correctWord.es;
                
            if (btnText) {
                btn.classList.add('correct');
            } else if (btn === selectedOption) {
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
        timerProgress.style.width = '100%';
        timerProgress.style.transition = `width ${this.timeLeft}s linear`;
        
        setTimeout(() => {
            timerProgress.style.width = '0%';
        }, 10);
        
        this.timer = setTimeout(() => {
            // Tiempo agotado
            this.lives--;
            this.streak = 0;
            this.updateGameStats();
            this.ui.showToast('⏰ ¡Tiempo agotado!', 'error');
            
            if (this.lives <= 0) {
                this.endGame();
            } else {
                setTimeout(() => this.nextQuestion(), 1000);
            }
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
        
        const message = this.score === this.settings.get('questions') 
            ? '🎉 ¡Perfecto! ¡Has acertado todas!' 
            : `¡Juego terminado! Puntuación: ${this.score}/${this.settings.get('questions')}`;
            
        this.ui.showToast(message, 'info');
        
        // Volver al menú después de un delay
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
    }
}
