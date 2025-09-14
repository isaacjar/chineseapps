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

    static shouldShowGameToast() {
        return Math.random() < 0.33; // 1 de cada 3 probabilidad
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
        // Filtrar por niveles HSK seleccionados
        let filteredItems;
        // Juego 3 usa caracteres en lugar del archivo de vocabulario
        if (gameType === 3) {
            // Para el juego de caracteres, usar this.characters
            filteredItems = window.app.characters.filter(char => 
                settings.hskLevels.includes(char.level)
            );
        } else {
            // Para otros juegos, usar vocabulary
            filteredItems = vocabulary.filter(word => 
                settings.hskLevels.includes(word.level)
            );
        }
        
        // Mezclar y seleccionar
        const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(item => ({
            item: item,
            options: this.generateOptions(item, gameType, shuffled, settings)
        }));
    }
    
    static generateOptions(correctWord, gameType, vocabulary, settings) {
        const optionsCount = settings.difficulty === 1 ? 4 : 6;
        const options = [correctWord];
        
        // Seleccionar opciones incorrectas aleatorias
        while (options.length < optionsCount) {
            const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            
            // Para el juego 3, comparamos por pinyin
            const isDifferent = gameType === 3 ? 
                randomItem.pin !== correctItem.pin : 
                randomItem.ch !== correctItem.ch;
                
            if (isDifferent && !options.some(opt => 
                gameType === 3 ? opt.pin === randomItem.pin : opt.ch === randomItem.ch)) {
                options.push(randomItem);
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
        const currentLang = this.currentGame.settings.language;
        
        // Limpiar opciones anteriores
        optionsContainer.innerHTML = '';
        
        // Configurar pregunta según el tipo de juego
        if (this.currentGame.type === 1) {
           // Juego 1: Pregunta en chino
            if (this.currentGame.settings.showPinyin) {
                questionText.innerHTML = `<span class="chinese-char">${question.word.ch}</span><small class="pinyin-text"> [${question.word.pin}]</small>`;
            } else {
                questionText.innerHTML = `<span class="chinese-char">${question.word.ch}</span>`;
            }
        } else if (this.currentGame.type === 2) {
            // Juego 2: Pregunta en el idioma seleccionado 
            const translation = question.item[currentLang] || (currentLang === 'es' ? question.item.sp : question.item.en);
            questionText.textContent = translation;
        } else if (this.currentGame.type === 3) {
            // Juego 3: Mostrar el carácter, adivinar el pinyin
            questionText.innerHTML = `<span class="chinese-char">${question.item.ch}</span>`;
            
            // Añadir clase específica para este juego
            document.getElementById('game-screen').classList.add('game-type-3');
        }
        
        // Crear botones de opciones
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';

            // Añadir atributo data-pin para facilitar la comparación
            button.setAttribute('data-pin', option.pin);
            
            // Configurar texto según el tipo de juego
            if (this.currentGame.type === 1) {
                // Juego 1: Opciones en el idioma seleccionado
                const currentLang = this.currentGame.settings.language;
                const translation = option[currentLang] || (currentLang === 'es' ? option.sp : option.en);
                button.textContent = translation;
            } else if (this.currentGame.type === 2) {
                // Juego 2: Opciones en chino
                if (this.currentGame.settings.showPinyin) {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span><small class="pinyin-text">${option.pin}</small>`;
                } else {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span>`;
                }
            } else if (this.currentGame.type === 3) {
                // Juego 3: Opciones de pinyin
                button.textContent = option.pin;
            }
            
            button.addEventListener('click', () => {
                this.checkAnswer(option, question.item);
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
        const currentLang = this.currentGame.settings.language;
        const langData = this.languageData[currentLang] || this.languageData.en;
        UI.showToast(langData.timeOut || 'Time\'s up!');
        
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
        
        let isCorrect;
        const options = document.querySelectorAll('.option-btn');

        // Determinar si la respuesta es correcta según el tipo de juego
        if (this.currentGame.type === 1) {
            // Juego 1: Comparar por caracteres chinos
            isCorrect = selectedOption.ch === correctItem.ch;
        } else if (this.currentGame.type === 2) {
            // Juego 2: Comparar por caracteres chinos
            isCorrect = selectedOption.ch === correctItem.ch;
        } else if (this.currentGame.type === 3) {
            // Juego 3: Comparar por pinyin
            isCorrect = selectedOption.pin === correctItem.pin;
        }
        
        // Encontrar el botón correcto
        let correctButton = null;
        options.forEach(button => {
            let buttonContent;
            let correctContent;
            
            if (this.currentGame.type === 1) {
                // Juego 1: Comparar contenido de texto (idioma seleccionado)
                const currentLang = this.currentGame.settings.language;
                buttonValue = button.textContent;
                const correctTranslation = correctItem[currentLang] || (currentLang === 'es' ? correctItem.sp : correctItem.en);
                correctValue = correctTranslation;
            } else if (this.currentGame.type === 2) {
                // Juego 2: Comparar caracteres chinos
                buttonValue = button.getAttribute('data-ch');
                correctValue = correctItem.ch;
            } else if (this.currentGame.type === 3) {
                // Juego 3: Comparar pinyin
                buttonValue = button.getAttribute('data-pin');
                correctValue = correctItem.pin;
            }
            
            if (buttonContent === correctContent) {
                correctButton = button;
            }
            
            // Deshabilitar todos los botones
            button.disabled = true;
        });
        
        if (isCorrect) {
            // Respuesta correcta
            this.handleCorrectAnswer(correctWord, correctButton);
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
    
    static handleCorrectAnswer(correctWord, correctButton) {
        // Incrementar puntuación y racha
        this.currentGame.score += 10;
        this.currentGame.streak += 1;
        
        // Mostrar mensaje de acierto aleatorio (1 de cada 3 veces)
        if (this.shouldShowGameToast()) {
            const currentLang = this.currentGame.settings.language;
            const successMessages = this.languageData[this.currentGame.settings.language]?.successMessages || 
                                  this.languageData.en.successMessages;
            const randomKey = 's' + (Math.floor(Math.random() * 10) + 1);
            UI.showToast(successMessages[randomKey]);
        }
        
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
        
        // Mostrar mensaje de error aleatorio (1 de cada 3 veces)
        if (this.shouldShowGameToast()) {
            const currentLang = this.currentGame.settings.language;
            const failMessages = this.languageData[this.currentGame.settings.language]?.failMessages || 
                               this.languageData.en.failMessages;
            const randomKey = 'f' + (Math.floor(Math.random() * 10) + 1);
            UI.showToast(failMessages[randomKey]);
        }
        
        // Efecto visual en los botones
        const options = document.querySelectorAll('.option-btn');
        options.forEach(button => {
            const buttonCh = button.getAttribute('data-ch');
            const selectedCh = selectedOption.ch;
            
            if (buttonCh === selectedCh) {
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
        const currentLang = this.currentGame.settings.language;
        const langData = this.languageData[currentLang] || this.languageData.en;
        
        if (this.currentGame.lives <= 0) {
            message = langData.gameOver || 'Game Over';
        } else {
            message = `${langData.gameCompleted || 'Game completed'}! ${this.currentGame.score} puntos`;
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
