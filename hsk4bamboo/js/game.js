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
        // Filtrar vocabulario por niveles HSK seleccionados
        const filteredVocabulary = vocabulary.filter(word => 
            settings.hskLevels.includes(word.level)
        );
        
        // Mezclar vocabulario filtrado
        const shuffled = [...filteredVocabulary].sort(() => Math.random() - 0.5);
        
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
           // Juego 1: Pregunta en chino
            if (this.currentGame.settings.showPinyin) {
                questionText.innerHTML = `${question.word.ch}<br><small>${question.word.pin}</small>`;
            } else {
                questionText.textContent = question.word.ch;
            }
        } else {
            // Juego 2: Pregunta en el idioma seleccionado 
            const lang = this.currentGame.settings.language;
            questionText.textContent = question.word[lang] || question.word.en || question.word.sp;
        }
        
        // Crear botones de opciones
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
            // Configurar texto según el tipo de juego
            if (this.currentGame.type === 1) {
                // Juego 1: Opciones en el idioma seleccionado
                const lang = this.currentGame.settings.language;
                button.textContent = option[lang] || option.en || option.sp;
            } else {
                // Juego 2: Opciones en chino
                if (this.currentGame.settings.showPinyin) {
                    button.innerHTML = `${option.ch}<br><small>${option.pin}</small>`;
                } else {
                    button.textContent = option.ch;
                }
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
        // Limpiar temporizador anterior si existe
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const timerBar = document.getElementById('timer-bar');
        const timePerQuestion = this.currentGame.settings.time * 1000; // convertir a ms
        
        // Reiniciar la barra de tiempo
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        
        // Forzar reflow para que la transición se reinicie correctamente
        timerBar.offsetHeight;
        
        // Iniciar la animación de la barra
        timerBar.style.transition = `width ${timePerQuestion}ms linear`;
        timerBar.style.width = '0%';
        
        // Configurar el temporizador para tiempo agotado
        this.timer = setTimeout(() => {
            this.handleTimeOut();
        }, timePerQuestion);
    }
    
    static handleTimeOut() {
        // Verificar que el juego todavía esté activo
        if (!this.currentGame) return;
        
        // Incrementar contador de veces mostrada
        const currentWord = this.currentGame.questions[this.currentGame.currentQuestion].word;
        currentWord.s = (currentWord.s || 0) + 1;
        this.saveUserStats();
        
        // Mostrar mensaje de tiempo agotado
        UI.showToast(this.languageData[this.currentGame.settings.language].timeOut || '¡Tiempo agotado!');
        
        // Pasar a la siguiente pregunta después de un breve delay
        setTimeout(() => {
            // Verificar nuevamente que el juego todavía esté activo
            if (this.currentGame) {
                this.nextQuestion();
            }
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
            let buttonContent;
            let correctContent;
            
            if (this.currentGame.type === 1) {
                // Juego 1: Comparar contenido de texto (idioma seleccionado)
                buttonContent = button.textContent;
                const lang = this.currentGame.settings.language;
                correctContent = correctWord[lang] || correctWord.en || correctWord.sp;
            } else {
                // Juego 2: Comparar caracteres chinos
                buttonContent = button.textContent.split('\n')[0]; // Solo los caracteres chinos
                correctContent = correctWord.ch;
            }
            
            if (buttonContent === correctContent) {
                correctButton = button;
            }
            
            // Deshabilitar todos los botones
            button.disabled = true;
        });
        
        if (isCorrect) {
            // Respuesta correcta
            this.handleCorrectAnswer(correctWord);
        } else {
            // Respuesta incorrecta
            this.handleIncorrectAnswer(selectedOption, correctButton);
        }
        
        // Pasar a la siguiente pregunta después de un breve delay
        setTimeout(() => {
            // Verificar que el juego todavía esté activo antes de continuar
            if (this.currentGame) {
                this.nextQuestion();
            }
        }, 2000);
    }
    
    static handleCorrectAnswer(correctWord) {
        // Incrementar puntuación y racha
        this.currentGame.score += 10;
        this.currentGame.streak += 1;
        
        // Mostrar mensaje de acierto aleatorio
        const successMessages = this.languageData[this.currentGame.settings.language]?.successMessages || 
                              this.languageData.en.successMessages;
        const randomKey = 's' + (Math.floor(Math.random() * 10) + 1);
        UI.showToast(successMessages[randomKey]);
        
        // Efecto visual en el botón correcto - encontrar el botón que coincide con la respuesta correcta
        const lang = this.currentGame.settings.language;
        const correctContent = this.currentGame.type === 1 ? 
            (correctWord[lang] || correctWord.en || correctWord.sp) : 
            correctWord.ch;
        
        const correctButton = [...document.querySelectorAll('.option-btn')].find(btn => {
            if (this.currentGame.type === 1) {
                return btn.textContent === correctContent;
            } else {
                // Para juego 2, comparar solo los caracteres chinos (ignorar pinyin)
                return btn.textContent.split('\n')[0] === correctContent;
            }
        });
        
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
            let buttonContent;
            let selectedContent;
            
            if (this.currentGame.type === 1) {
                // Juego 1: Comparar contenido de texto
                buttonContent = button.textContent;
                const lang = this.currentGame.settings.language;
                selectedContent = selectedOption[lang] || selectedOption.en || selectedOption.sp;
            } else {
                // Juego 2: Comparar caracteres chinos
                buttonContent = button.textContent.split('\n')[0];
                selectedContent = selectedOption.ch;
            }
            
            if (buttonContent === selectedContent) {
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
                // Verificar que el juego todavía esté activo
                if (this.currentGame) {
                    this.endGame();
                }
            }, 1500);
            return;
        }    
    }
    
    static nextQuestion() {
        // Verificar que el juego todavía esté activo
        if (!this.currentGame) return;
        
        this.currentGame.currentQuestion += 1;
        
        // Verificar si hemos llegado al final de las preguntas
        if (this.currentGame.currentQuestion >= this.currentGame.questions.length) {
            this.endGame();
            return;
        }
            
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
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
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

    static saveUserStats() {
        localStorage.setItem('hskBambooStats', JSON.stringify(this.vocabulary));
    }
}
