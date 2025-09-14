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
        // Determinar qué conjunto de datos usar
        let dataSource;
        if (gameType === 3) {
            dataSource = window.app.characters; // Juego 3 usa caracteres
        } else {
            dataSource = vocabulary; // Juegos 1 y 2 usan vocabulario
        }
        
        // Preparar preguntas
        const questions = this.prepareQuestions(gameType, settings.questions, dataSource, settings);
        
        // Verificar que hay preguntas
        if (questions.length === 0) {
            UI.showToast('No hay preguntas disponibles con los niveles HSK seleccionados');
            return;
        }        

        // Ocultar menú y mostrar pantalla de juego
        UI.showScreen('game');
        UI.showGameHeader(true);
        
        // Inicializar estado del juego
        this.currentGame = {
            type: gameType,
            settings: {...settings},
            //vocabulary: [...vocabulary],
            currentQuestion: 0,
            score: 0,
            streak: 0,
            lives: settings.lives,
            questions: questions
        };
        
        // Actualizar header
        this.updateHeader();
        
        // Mostrar primera pregunta
        this.showQuestion();
    }
    
    static prepareQuestions(gameType, count, dataSource, settings) {
        // Filtrar por niveles HSK seleccionados
        const filteredItems = dataSource.filter(item => 
            settings.hskLevels.includes(item.level)
        );

        // Verificar que hay suficientes items
        if (filteredItems.length === 0) {
            console.error('No hay items que coincidan con los niveles HSK seleccionados');
            return [];
        }
            
       // Mezclar y seleccionar
        const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
        const selectedItems = shuffled.slice(0, count);
        
        // Preparar preguntas con opciones
        return selectedItems.map(item => ({
            item: item,
            options: this.generateOptions(item, gameType, shuffled, settings) 
        }));
    }
    
    static generateOptions(correctWord, gameType, vocabulary, settings) {
        const optionsCount = settings.difficulty === 1 ? 4 : 6;
        const options = [correctItem];

        // Si no hay suficientes items, retornar solo el correcto
        if (items.length <= 1) {
            return options;
        }
            
        // Seleccionar opciones incorrectas aleatorias
        while (options.length < optionsCount) {
            const randomIndex = Math.floor(Math.random() * items.length);
            const randomItem = items[randomIndex];
            
            // Para el juego 3, comparamos por pinyin
            const isDifferent = gameType === 3 ? 
                randomItem.pin !== correctItem.pin : 
                randomItem.ch !== correctItem.ch;
                
            const alreadyInOptions = gameType === 3 ? 
                options.some(opt => opt.pin === randomItem.pin) : 
                options.some(opt => opt.ch === randomItem.ch);
                
            if (isDifferent && !alreadyInOptions) {
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
        document.getElementById('game-screen').className = 'screen active game-type-' + this.currentGame.type;
        
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

            // Configurar texto según el tipo de juego
            if (this.currentGame.type === 1) {
                // Juego 1: Opciones en el idioma seleccionado
                const translation = option[currentLang] || (currentLang === 'es' ? option.sp : option.en);
                button.textContent = translation;
                button.setAttribute('data-ch', option.ch); // Para comparación
            } else if (this.currentGame.type === 2) {
                // Juego 2: Opciones en chino
                if (this.currentGame.settings.showPinyin) {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span><small class="pinyin-text">${option.pin}</small>`;
                } else {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span>`;
                }
                button.setAttribute('data-ch', option.ch); // Para comparación
            } else if (this.currentGame.type === 3) {
                // Juego 3: Opciones de pinyin
                button.textContent = option.pin;
                button.setAttribute('data-pin', option.pin); // Para comparación
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
        correctItem.s = (correctItem.s || 0) + 1;
        
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
        options.forEach(button => {
            button.disabled = true;
        
            let buttonValue;
            let correctValue;
            
            if (this.currentGame.type === 1) {
                // Juego 1: El valor del botón es la traducción, pero comparamos por carácter chino
                buttonValue = button.getAttribute('data-ch');
                correctValue = correctItem.ch;
            } else if (this.currentGame.type === 2) {
                // Juego 2: Comparar por caracteres chinos
                buttonValue = button.getAttribute('data-ch');
                correctValue = correctItem.ch;
            } else if (this.currentGame.type === 3) {
                // Juego 3: Comparar por pinyin
                buttonValue = button.getAttribute('data-pin');
                correctValue = correctItem.pin;
            }
            
            // Marcar como correcta o incorrecta
            if (buttonValue === correctValue) {
                button.classList.add('correct');
                button.classList.add('blink');
            } else if ((this.currentGame.type === 1 && button.getAttribute('data-ch') === selectedOption.ch) ||
                       (this.currentGame.type === 2 && button.getAttribute('data-ch') === selectedOption.ch) ||
                       (this.currentGame.type === 3 && button.getAttribute('data-pin') === selectedOption.pin)) {
                button.classList.add('incorrect');
                button.classList.add('shake');
            }
        });
        
        if (isCorrect) {
            // Respuesta correcta
            this.handleCorrectAnswer(correctButton);
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
