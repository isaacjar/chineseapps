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
        return Math.random() < 0.33;
    }
    
    static startGame(gameType, settings, vocabulary) {
        // Determinar qué conjunto de datos usar
        let dataSource;
        if (gameType === 3) {
            dataSource = window.app.characters || [];
        } else {
            dataSource = vocabulary;
        }
        
        // Preparar preguntas
        const questions = this.prepareQuestions(gameType, settings.questions, dataSource, settings);
        
        if (questions.length === 0) {
            UI.showToast('No hay preguntas disponibles con los niveles HSK seleccionados');
            return;
        }        

        UI.showScreen('game');
        UI.showGameHeader(true);
        
        this.currentGame = {
            type: gameType,
            settings: {...settings},
            currentQuestion: 0,
            score: 0,
            streak: 0,
            lives: settings.lives,
            questions: questions
        };
        
        this.updateHeader();
        this.showQuestion();
    }
    
    static prepareQuestions(gameType, count, dataSource, settings) {
        const filteredItems = dataSource.filter(item => 
            settings.hskLevels.includes(item.level)
        );

        if (filteredItems.length === 0) {
            console.error('No hay items que coincidan con los niveles HSK seleccionados');
            return [];
        }
            
        const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
        const selectedItems = shuffled.slice(0, count);
        
        return selectedItems.map(item => ({
            item: item,
            options: this.generateOptions(item, gameType, shuffled, settings) 
        }));
    }
    
    static generateOptions(correctWord, gameType, items, settings) {
        const optionsCount = settings.difficulty === 1 ? 4 : 6;
        const options = [correctWord];

        if (items.length <= 1) {
            return options;
        }
            
        let attempts = 0;
        const maxAttempts = 100;
        
        while (options.length < optionsCount && attempts < maxAttempts) {
            attempts++;
            const randomIndex = Math.floor(Math.random() * items.length);
            const randomItem = items[randomIndex];
            
            const isDifferent = gameType === 3 ? 
                randomItem.pin !== correctWord.pin : 
                randomItem.ch !== correctWord.ch;
                
            const alreadyInOptions = gameType === 3 ? 
                options.some(opt => opt.pin === randomItem.pin) : 
                options.some(opt => opt.ch === randomItem.ch);
                
            if (isDifferent && !alreadyInOptions) {
                options.push(randomItem);
            }
        }
        
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
        
        // Limpiar y preparar la pantalla de juego
        optionsContainer.innerHTML = '';
        
        // CORRECCIÓN IMPORTANTE: Gestionar clases CSS correctamente
        const gameScreen = document.getElementById('game-screen');
        // Remover todas las clases de tipo de juego anteriores
        gameScreen.classList.remove('game-type-1', 'game-type-2', 'game-type-3');
        // Añadir la clase del tipo de juego actual
        gameScreen.classList.add('game-type-' + this.currentGame.type);
        // Asegurar que tenga la clase active
        gameScreen.classList.add('active');
        
        // Configurar pregunta según el tipo de juego
        if (this.currentGame.type === 1) {
            if (this.currentGame.settings.showPinyin) {
                questionText.innerHTML = `<span class="chinese-char">${question.item.ch}</span> <small class="pinyin-text"> ${question.item.pin}</small>`;
            } else {
                questionText.innerHTML = `<span class="chinese-char">${question.item.ch}</span>`;
            }
        } else if (this.currentGame.type === 2) {
            const translation = question.item[currentLang] || (currentLang === 'es' ? question.item.sp : question.item.en);
            questionText.textContent = translation;
        } else if (this.currentGame.type === 3) {
            questionText.innerHTML = `<span class="chinese-char">${question.item.ch}</span>`;
        }
        
        // Crear botones de opciones
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';

            if (this.currentGame.type === 1) {
                const translation = option[currentLang] || (currentLang === 'es' ? option.sp : option.en);
                button.textContent = translation;
                button.setAttribute('data-ch', option.ch);
            } else if (this.currentGame.type === 2) {
                if (this.currentGame.settings.showPinyin) {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span> <small class="pinyin-text">  ${option.pin}</small>`;
                } else {
                    button.innerHTML = `<span class="chinese-char">${option.ch}</span>`;
                }
                button.setAttribute('data-ch', option.ch);
            } else if (this.currentGame.type === 3) {
                button.textContent = option.pin;
                button.setAttribute('data-pin', option.pin);
            }
            
            button.addEventListener('click', () => {
                this.checkAnswer(option, question.item);
            });
            
            optionsContainer.appendChild(button);
        });
        
        this.startTimer();
    }
    
    static startTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const timerBar = document.getElementById('timer-bar');
        const timePerQuestion = this.currentGame.settings.time * 1000;
        
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        timerBar.offsetHeight; // Forzar reflow
        timerBar.style.transition = `width ${timePerQuestion}ms linear`;
        timerBar.style.width = '0%';
        
        this.timer = setTimeout(() => {
            this.handleTimeOut();
        }, timePerQuestion);
    }
    
    static handleTimeOut() {
        if (!this.currentGame) return;
        
        const currentItem = this.currentGame.questions[this.currentGame.currentQuestion].item;
        currentItem.s = (currentItem.s || 0) + 1;
        this.saveUserStats();
        
        const currentLang = this.currentGame.settings.language;
        const langData = this.languageData[currentLang] || this.languageData.en;
        UI.showToast(langData.timeOut || 'Time\'s up!');
        
        setTimeout(() => {
            if (this.currentGame) {
                this.nextQuestion();
            }
        }, 1500);
    }
    
    static checkAnswer(selectedOption, correctItem) {
        clearTimeout(this.timer);
        
        correctItem.s = (correctItem.s || 0) + 1;
        
        let isCorrect;
        const options = document.querySelectorAll('.option-btn');

        if (this.currentGame.type === 1 || this.currentGame.type === 2) {
            isCorrect = selectedOption.ch === correctItem.ch;
        } else if (this.currentGame.type === 3) {
            isCorrect = selectedOption.pin === correctItem.pin;
        }
        
        options.forEach(button => {
            button.disabled = true;
        
            let buttonValue;
            let correctValue;
            
            if (this.currentGame.type === 1 || this.currentGame.type === 2) {
                buttonValue = button.getAttribute('data-ch');
                correctValue = correctItem.ch;
            } else if (this.currentGame.type === 3) {
                buttonValue = button.getAttribute('data-pin');
                correctValue = correctItem.pin;
            }
            
            if (buttonValue === correctValue) {
                button.classList.add('correct', 'blink');
            } else if ((this.currentGame.type === 1 || this.currentGame.type === 2) && 
                       button.getAttribute('data-ch') === selectedOption.ch) {
                button.classList.add('incorrect', 'shake');
            } else if (this.currentGame.type === 3 && 
                       button.getAttribute('data-pin') === selectedOption.pin) {
                button.classList.add('incorrect', 'shake');
            }
        });
        
        if (isCorrect) {
            this.handleCorrectAnswer(correctItem);
        } else {
            this.handleIncorrectAnswer(selectedOption, correctItem);
        }
        
        setTimeout(() => {
            if (this.currentGame) {
                this.nextQuestion();
            }
        }, 2000);
    }
    
    static handleCorrectAnswer(correctItem) {
        this.currentGame.score += 10;
        this.currentGame.streak += 1;
        
        if (this.shouldShowGameToast()) {
            const currentLang = this.currentGame.settings.language;
            const successMessages = this.languageData[currentLang]?.successMessages || 
                                  this.languageData.en.successMessages;
            const randomKey = 's' + (Math.floor(Math.random() * 10) + 1);
            UI.showToast(successMessages[randomKey]);
        }
        
        this.saveUserStats();
    }
    
    static handleIncorrectAnswer(selectedOption, correctItem) {
        correctItem.e = (correctItem.e || 0) + 1;
        this.saveUserStats();
        
        this.currentGame.streak = 0;
        this.currentGame.lives -= 1;
        
        if (this.shouldShowGameToast()) {
            const currentLang = this.currentGame.settings.language;
            const failMessages = this.languageData[currentLang]?.failMessages || 
                               this.languageData.en.failMessages;
            const randomKey = 'f' + (Math.floor(Math.random() * 10) + 1);
            UI.showToast(failMessages[randomKey]);
        }
        
        if (this.currentGame.lives <= 0) {
            setTimeout(() => {
                if (this.currentGame) {
                    this.endGame();
                }
            }, 1500);
        }    
    }
    
    static nextQuestion() {
        if (!this.currentGame) return;
        
        this.currentGame.currentQuestion += 1;
        
        if (this.currentGame.currentQuestion >= this.currentGame.questions.length) {
            this.endGame();
            return;
        }
            
        this.updateHeader();
        this.showQuestion();
    }
    
    static updateHeader() {
        document.getElementById('stats-progress').textContent = `🌱 ${this.currentGame.currentQuestion + 1}/${this.currentGame.questions.length}`;
        document.getElementById('stats-score').textContent = `🏅 ${this.currentGame.score}`;
        document.getElementById('stats-streak').textContent = `🔥 ${this.currentGame.streak}`;
        document.getElementById('stats-lives').textContent = `❤️ ${this.currentGame.lives}`;
    }
    
    static endGame() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        let message;
        const currentLang = this.currentGame.settings.language;
        const langData = this.languageData[currentLang] || this.languageData.en;
        
        if (this.currentGame.lives <= 0) {
            message = langData.gameOver || 'Game Over';
        } else {
            message = `${langData.gameCompleted || 'Game completed'}! ${this.currentGame.score} puntos`;
        }
        
        UI.showToast(message);
        
        setTimeout(() => {
            UI.showScreen('menu');
            UI.showGameHeader(false);
            this.currentGame = null;
        }, 2500);
    }

    static saveUserStats() {
        const allStats = [...this.vocabulary, ...(window.app.characters || [])];
        localStorage.setItem('hskBambooStats', JSON.stringify(allStats));
    }
}