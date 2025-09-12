// game.js - Lógica de juegos
class Game {
    static init(vocabulary, languageData) {
        // Cargar estadísticas guardadas si existen
        const savedStats = localStorage.getItem('hskBambooStats');
        if (savedStats) {
            const statsData = JSON.parse(savedStats);
            // Combinar con el vocabulario actual
            vocabulary.forEach((word, index) => {
                const savedWord = statsData.find(w => w.ch === word.ch);
                if (savedWord) {
                    word.s = savedWord.s || 0;
                    word.e = savedWord.e || 0;
                }
            });
        }    
        
        this.vocabulary = vocabulary;
        this.languageData = languageData;
        this.currentGame = null;
    }
    
    static startGame(gameType, settings, vocabulary) {
        // Ocultar menú y mostrar pantalla de juego
        UI.showScreen('game');
        UI.showGameHeader(true);
        
        // Inicializar estado del juego
        this.currentGame = {
            type: gameType,
            settings: {...settings},
            vocabulary: [...vocabulary],
            currentQuestion: 0,
            score: 0,
            streak: 0,
            lives: settings.lives,
            questions: this.prepareQuestions(gameType, settings.questions, vocabulary, settings)
        };
        
        // Actualizar header
        this.updateHeader();
        
        // Mostrar primera pregunta
        this.showQuestion();
    }
    
    static prepareQuestions(gameType, count, vocabulary, settings) {
        // Mezclar vocabulario
        const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
        
        // Seleccionar las primeras 'count' palabras
        return shuffled.slice(0, count).map(word => ({
            word: word,
            options: this.generateOptions(word, gameType, shuffled, settings)
        }));
    }
    
    static generateOptions(correctWord, gameType, vocabulary, settings) {
        const optionsCount = settings.difficulty === 1 ? 4 : 6;
        const options = [correctWord];
        
        // Seleccionar opciones incorrectas aleatorias
        while (options.length < optionsCount) {
            const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            
            // Asegurarse de que no es la palabra correcta y no está ya en las opciones
            if (randomWord.ch !== correctWord.ch && 
                !options.some(opt => opt.ch === randomWord.ch)) {
                options.push(randomWord);
            }
        }
        
        // Mezclar opciones
        return options.sort(() => Math.random() - 0.5);
    }
    
    static showQuestion() {
        if (!this.currentGame || this.currentGame.currentQuestion >= this.currentGame.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.currentGame.questions[this.currentGame.currentQuestion];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        
        // Limpiar opciones anteriores
        optionsContainer.innerHTML = '';
        
        // Configurar pregunta según el tipo de juego
        if (this.currentGame.type === 1) {
            // Juego 1: Pregunta en español, opciones en el idioma seleccionado
            questionText.textContent = question.word.sp;
        } else {
            // Juego 2: Pregunta en el idioma seleccionado, opciones en español
            questionText.textContent = question.word[this.currentGame.settings.language];
        }
        
        // Crear botones de opciones
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            // Configurar texto según el tipo de juego
            if (this.currentGame.type === 1) {
                button.textContent = option[this.currentGame.settings.language];
            } else {
                button.textContent = option.sp;
            }
            
            button.addEventListener('click', () => {
                this.checkAnswer(option, question.word);
            });
            
            optionsContainer.appendChild(button);
        });
        
        // Iniciar temporizador
        this.startTimer();
    }
    
    static startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        const timerBar = document.getElementById('timer-bar');
        const timePerQuestion = this.currentGame.settings.time * 1000; // convertir a ms
        let timeLeft = timePerQuestion;
        
        timerBar.style.width = '100%';
        timerBar.style.transition = `width ${timePerQuestion}ms linear`;
        timerBar.style.width = '0%';
        
        this.timer = setTimeout(() => {
            this.handleTimeOut();
        }, timePerQuestion);
    }
    
    static handleTimeOut() {
        // Incrementar contador de veces mostrada
        const currentWord = this.currentGame.questions[this.currentGame.currentQuestion].word;
        currentWord.s = (currentWord.s || 0) + 1;
        this.saveUserStats();
        
        // Mostrar mensaje de tiempo agotado
        UI.showToast(this.languageData[this.currentGame.settings.language].timeOut || '¡Tiempo agotado!');
        
        // Pasar a la siguiente pregunta después de un breve delay
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    static checkAnswer(selectedOption, correctWord) {
        // Detener temporizador
        clearTimeout(this.timer);
        
        // Incrementar contador de veces mostrada
        correctWord.s = (correctWord.s || 0) + 1;
        
        const isCorrect = selectedOption.ch === correctWord.ch;
        const options = document.querySelectorAll('.option-btn');
        
        // Encontrar el botón correcto
        let correctButton = null;
        options.forEach(button => {
            let buttonText = button.textContent;
            let correctText;
            
            if (this.currentGame.type === 1) {
                correctText = correctWord[this.currentGame.settings.language];
            } else {
                correctText = correctWord.sp;
            }
            
            if (buttonText === correctText) {
                correctButton = button;
            }
            
            // Deshabilitar todos los botones
            button.disabled = true;
        });
        
        if (isCorrect) {
            // Respuesta correcta
            this.handleCorrectAnswer();
        } else {
            // Respuesta incorrecta
            this.handleIncorrectAnswer(selectedOption, correctButton);
        }
        
        // Pasar a la siguiente pregunta después de un breve delay
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    static handleCorrectAnswer() {
        // Incrementar puntuación y racha
        this.currentGame.score += 10;
        this.currentGame.streak += 1;
        
        // Mostrar mensaje de acierto aleatorio
        const successMessages = this.languageData[this.currentGame.settings.language]?.successMessages || 
                              this.languageData.en.successMessages;
        const randomKey = 's' + (Math.floor(Math.random() * 10) + 1);
        UI.showToast(successMessages[randomKey]);
        
        // Efecto visual en el botón correcto
        const correctButton = [...document.querySelectorAll('.option-btn')].find(btn => 
            !btn.classList.contains('incorrect')
        );
        if (correctButton) {
            correctButton.classList.add('correct');
            correctButton.classList.add('blink');
        }
    }
    
    static handleIncorrectAnswer(selectedOption, correctButton) {
        // Incrementar contador de errores
        const currentWord = this.currentGame.questions[this.currentGame.currentQuestion].word;
        currentWord.e = (currentWord.e || 0) + 1;
        this.saveUserStats();
        
        // Reiniciar racha
        this.currentGame.streak = 0;
        
        // Reducir vidas
        this.currentGame.lives -= 1;
        
        // Mostrar mensaje de error aleatorio
        const failMessages = this.languageData[this.currentGame.settings.language]?.failMessages || 
                           this.languageData.en.failMessages;
        const randomKey = 'f' + (Math.floor(Math.random() * 10) + 1);
        UI.showToast(failMessages[randomKey]);
        
        // Efecto visual en los botones
        const options = document.querySelectorAll('.option-btn');
        options.forEach(button => {
            let buttonText = button.textContent;
            let selectedText;
            
            if (this.currentGame.type === 1) {
                selectedText = selectedOption[this.currentGame.settings.language];
            } else {
                selectedText = selectedOption.sp;
            }
            
            if (buttonText === selectedText) {
                button.classList.add('incorrect');
                button.classList.add('shake');
            }
        });
        
        if (correctButton) {
            correctButton.classList.add('correct');
            correctButton.classList.add('blink');
        }
        
        // Verificar si se acabaron las vidas
        if (this.currentGame.lives <= 0) {
            setTimeout(() => {
                this.endGame();
            }, 1500);
            return;
        }
    }
    
    static nextQuestion() {
        this.currentGame.currentQuestion += 1;
        this.updateHeader();
        this.showQuestion();
    }
    
    static updateHeader() {
        const progress = `🌱 ${this.currentGame.currentQuestion + 1}/${this.currentGame.questions.length}`;
        const score = `🏅 ${this.currentGame.score}`;
        const streak = `🔥 ${this.currentGame.streak}`;
        const lives = `❤️ ${this.currentGame.lives}`;
        
        document.getElementById('stats-progress').textContent = progress;
        document.getElementById('stats-score').textContent = score;
        document.getElementById('stats-streak').textContent = streak;
        document.getElementById('stats-lives').textContent = lives;
    }
    
    static endGame() {
        // Limpiar temporizador
        clearTimeout(this.timer);
        
        // Mostrar mensaje final
        let message;
        if (this.currentGame.lives <= 0) {
            message = this.languageData[this.currentGame.settings.language]?.gameOver || 'Game Over';
        } else {
            message = `${this.languageData[this.currentGame.settings.language]?.gameCompleted || 'Juego completado'}! ${this.currentGame.score} puntos`;
        }
        
        UI.showToast(message);
        
        // Volver al menú después de un delay
        setTimeout(() => {
            UI.showScreen('menu');
            UI.showGameHeader(false);
            this.currentGame = null;
        }, 2500);
    }
}

static saveUserStats() {
    localStorage.setItem('hskBambooStats', JSON.stringify(this.vocabulary));
}
