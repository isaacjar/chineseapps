[file name]: game2.js
[file content begin]
class Game2 {
    constructor(settings, stats, ui) {
        this.settings = settings;
        this.stats = stats;
        this.ui = ui;
        this.currentGame = 'game3'; // Identificador único para este juego
        this.vocabulary = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.currentWord = null;
    }

    startGame() {
        if (!this.vocabulary.length) {
            this.ui.showToast('Primero selecciona un listado de vocabulario', 'error');
            this.ui.showScreen('lists-screen');
            return;
        }
        
        this.currentGame = 'game3';
        this.currentQuestion = 0;
        this.score = 0;
        this.lives = this.settings.get('lives');
        this.streak = 0;
        
        this.ui.showScreen('game-screen');
        this.ui.showGameStats();
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
        
        // Seleccionar palabra actual
        const currentIndex = Math.floor(Math.random() * this.vocabulary.length);
        this.currentWord = this.vocabulary[currentIndex];
        
        if (!this.currentWord.pin) {
            console.warn('Palabra sin pinyin, buscando otra...');
            this.nextQuestion();
            return;
        }
        
        // Obtener opciones incorrectas
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
        
        // Calcular número de sílabas de la palabra correcta
        const correctSyllables = this.countSyllables(this.currentWord.pin);
        
        // Primero intentar encontrar palabras con el mismo número de sílabas
        const sameSyllableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (!usedIndices.has(i) && this.vocabulary[i].pin) {
                const syllables = this.countSyllables(this.vocabulary[i].pin);
                if (syllables === correctSyllables) {
                    sameSyllableWords.push(this.vocabulary[i]);
                    usedIndices.add(i);
                }
            }
        }
        
        // Si no hay suficientes palabras con el mismo número de sílabas, usar cualquier palabra
        let availableWords = [...sameSyllableWords];
        if (availableWords.length < numOptions) {
            for (let i = 0; i < this.vocabulary.length; i++) {
                if (!usedIndices.has(i) && this.vocabulary[i].pin) {
                    availableWords.push(this.vocabulary[i]);
                    usedIndices.add(i);
                    if (availableWords.length >= numOptions + 10) break; // Límite razonable
                }
            }
        }
        
        // Seleccionar opciones incorrectas
        while (incorrectOptions.length < numOptions && availableWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableWords.length);
            incorrectOptions.push(availableWords[randomIndex]);
            availableWords.splice(randomIndex, 1);
        }
        
        return incorrectOptions;
    }

    countSyllables(pinyin) {
        if (!pinyin) return 0;
        // Contar sílabas basado en espacios y apóstrofes
        return pinyin.split(/[\s']+/).filter(syllable => syllable.length > 0).length;
    }

    displayQuestion(word) {
        const questionElement = document.getElementById('question-text');
        questionElement.innerHTML = '';
        
        // Aplicar clase de fuente
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        // Mostrar caracter chino (grande)
        const chineseElement = document.createElement('div');
        chineseElement.className = `chinese-character ${fontClass}`;
        chineseElement.textContent = word.ch || '';
        questionElement.appendChild(chineseElement);
        
        // Mostrar instrucción
        const instructionElement = document.createElement('div');
        instructionElement.className = 'instruction-text';
        instructionElement.textContent = 'Selecciona el pinyin correcto:';
        instructionElement.style.marginTop = '1rem';
        instructionElement.style.fontSize = '1.2rem';
        instructionElement.style.color = '#795548';
        questionElement.appendChild(instructionElement);
    }

    displayOptions(options, correctWord) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Ajustar grid según dificultad
        const difficulty = this.settings.get('difficulty');
        if (window.innerHeight > window.innerWidth) {
            optionsContainer.style.gridTemplateColumns = '1fr 1fr';
        } else {
            optionsContainer.style.gridTemplateColumns = difficulty === 1 ? '1fr 1fr' : '1fr 1fr 1fr';
        }

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            // Mostrar solo el pinyin como opción
            const pinyinElement = document.createElement('div');
            pinyinElement.className = 'pinyin-option';
            pinyinElement.textContent = option.pin || '';
            pinyinElement.style.fontSize = '1.4rem';
            pinyinElement.style.fontWeight = 'bold';
            pinyinElement.style.color = '#5d4037';
            
            button.appendChild(pinyinElement);
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
        
        options.forEach(btn => {
            const pinyinText = btn.querySelector('.pinyin-option').textContent;
            const isThisCorrectOption = pinyinText === correctWord.pin;
            const isThisSelectedOption = pinyinText === selectedOption.pin;
            
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
        
        timerProgress.style.transition = `width ${this.timeLeft}s linear`;
        timerProgress.style.width = '100%';
        
        setTimeout(() => {
            timerProgress.style.width = '0%';
        }, 50);
        
        this.timer = setTimeout(() => {
            // Tiempo agotado - mostrar respuesta correcta
            const options = document.querySelectorAll('.option-btn');
            options.forEach(btn => {
                const pinyinText = btn.querySelector('.pinyin-option').textContent;
                const isThisCorrectOption = pinyinText === this.currentWord.pin;
                
                if (isThisCorrectOption) {
                    btn.classList.add('correct-answer');
                }
                btn.disabled = true;
            });
            
            this.lives--;
            this.streak = 0;
            this.updateGameStats();
            this.ui.showToast('⏰ ¡Tiempo agotado!', 'error');
            
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
        this.timer = null;
        
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

    // Método para cargar vocabulario (compatible con la interfaz existente)
    async loadVocabularyList(filename) {
        if (!filename) {
            console.error('No se proporcionó nombre de archivo');
            return false;
        }
        
        try {
            console.log('Cargando listado:', filename);
            const response = await fetch(`https://isaacjarvis.github.io/chineseapps/voclists/${filename}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('El listado está vacío o no es un array válido');
            }
            
            // Filtrar palabras que tengan pinyin
            this.vocabulary = data.filter(item => item.pin && item.pin.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No hay palabras con pinyin en este listado');
            }
            
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras con pinyin`);
            return true;
            
        } catch (error) {
            console.error('Error cargando vocabulario:', error);
            
            // Usar datos de ejemplo si falla la carga
            this.vocabulary = [
                { ch: "你好", pin: "nǐ hǎo", en: "hello", es: "hola" },
                { ch: "谢谢", pin: "xièxie", en: "thank you", es: "gracias" },
                { ch: "小", pin: "xiǎo", en: "small", es: "pequeño" },
                { ch: "大", pin: "dà", en: "big", es: "grande" },
                { ch: "中国", pin: "zhōng guó", en: "China", es: "China" },
                { ch: "美国", pin: "měi guó", en: "USA", es: "EEUU" }
            ].filter(item => item.pin);
            
            if (this.ui) {
                this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            }
            
            return true;
        }
    }
}
[file content end]
