class Game2 {
    constructor(settings, stats, ui) {
        this.settings = settings;
        this.stats = stats;
        this.ui = ui;
        this.currentGame = 'game3';
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
        
        if (!this.currentWord.pin) {
            console.warn('Palabra sin pinyin, buscando otra...');
            this.nextQuestion();
            return;
        }
        
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
        // Si no se pudieron encontrar suficientes opciones, intentar con otra palabra
        if (incorrectOptions.length < (this.settings.get('difficulty') === 1 ? 3 : 5)) {
            console.warn('No hay suficientes opciones, buscando otra palabra...');
            this.nextQuestion();
            return;
        }
        
        const allOptions = [this.currentWord, ...incorrectOptions];
        this.shuffleArray(allOptions);
        
        this.displayQuestion(this.currentWord);
        this.displayOptions(allOptions, this.currentWord);
        this.startTimer();
    }

    getIncorrectOptions(correctIndex) {
        const difficulty = this.settings.get('difficulty');
        const numOptions = difficulty === 1 ? 3 : 5;
        const minSameSyllables = difficulty === 1 ? 4 : 6; // Mínimo requerido para usar solo mismo número de sílabas
        
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        // Calcular número de sílabas de la palabra correcta
        const correctSyllables = this.countSyllables(this.currentWord.pin);
        
        // Contar cuántas palabras tienen el mismo número de sílabas (excluyendo la correcta)
        const sameSyllableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (!usedIndices.has(i) && this.vocabulary[i].pin) {
                const syllables = this.countSyllables(this.vocabulary[i].pin);
                if (syllables === correctSyllables) {
                    sameSyllableWords.push(this.vocabulary[i]);
                }
            }
        }
        
        console.log(`Palabras con ${correctSyllables} sílabas: ${sameSyllableWords.length} (mínimo requerido: ${minSameSyllables})`);
        
        // Estrategia según la dificultad y disponibilidad de palabras con mismo número de sílabas
        if (sameSyllableWords.length >= minSameSyllables) {
            // Caso ideal: usar solo palabras con el mismo número de sílabas
            console.log(`Usando estrategia: Solo mismo número de sílabas (${correctSyllables})`);
            
            // Mezclar las palabras con mismo número de sílabas
            this.shuffleArray(sameSyllableWords);
            
            // Tomar las primeras numOptions
            for (let i = 0; i < Math.min(numOptions, sameSyllableWords.length); i++) {
                incorrectOptions.push(sameSyllableWords[i]);
                usedIndices.add(this.vocabulary.indexOf(sameSyllableWords[i]));
            }
            
        } else {
            // Caso fallback: usar cualquier palabra con pinyin disponible
            console.log(`Usando estrategia: Fallback - cualquier palabra con pinyin`);
            
            const availableWords = [];
            for (let i = 0; i < this.vocabulary.length; i++) {
                if (!usedIndices.has(i) && this.vocabulary[i].pin) {
                    availableWords.push(this.vocabulary[i]);
                    usedIndices.add(i);
                    if (availableWords.length >= numOptions + 10) break; // Límite razonable
                }
            }
            
            // Mezclar y seleccionar
            this.shuffleArray(availableWords);
            for (let i = 0; i < Math.min(numOptions, availableWords.length); i++) {
                incorrectOptions.push(availableWords[i]);
            }
        }
        
        console.log(`Opciones incorrectas generadas: ${incorrectOptions.length} (requeridas: ${numOptions})`);
        return incorrectOptions;
    }

    countSyllables(pinyin) {
        if (!pinyin) return 0;
        // Contar sílabas basado en espacios y apóstrofes, ignorando tonos
        const cleanPinyin = pinyin.replace(/[¹²³⁴]/, ''); // Remover marcas de tono si existen
        return cleanPinyin.split(/[\s']+/).filter(syllable => syllable.length > 0).length;
    }

    displayQuestion(word) {
        const questionElement = document.getElementById('question-text');
        questionElement.innerHTML = '';
        
        const fontClass = this.settings.get('chineseFont') || 'noto-serif';
        
        const chineseElement = document.createElement('div');
        chineseElement.className = `chinese-character ${fontClass}`;
        chineseElement.textContent = word.ch || '';
        questionElement.appendChild(chineseElement);
        
        const instructionElement = document.createElement('div');
        instructionElement.className = 'instruction-text';
        //instructionElement.textContent = 'Selecciona el pinyin correcto:';
        instructionElement.style.marginTop = '1rem';
        instructionElement.style.fontSize = '1.2rem';
        instructionElement.style.color = '#795548';
        questionElement.appendChild(instructionElement);
    }

    displayOptions(options, correctWord) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const difficulty = this.settings.get('difficulty');
        if (window.innerHeight > window.innerWidth) {
            optionsContainer.style.gridTemplateColumns = '1fr 1fr';
        } else {
            optionsContainer.style.gridTemplateColumns = difficulty === 1 ? '1fr 1fr' : '1fr 1fr 1fr';
        }

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            
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
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        const isCorrect = selectedOption === correctWord;
        this.stats.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.option-btn');
        
        options.forEach(btn => {
            const pinyinText = btn.querySelector('.pinyin-option').textContent;
            const isThisCorrectOption = pinyinText === correctWord.pin;
            const isThisSelectedOption = pinyinText === selectedOption.pin;
            
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
            
            this.vocabulary = data.filter(item => item.pin && item.pin.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No hay palabras con pinyin en este listado');
            }
            
            // Análisis del listado cargado
            const syllableAnalysis = this.analyzeSyllables();
            console.log('Análisis de sílabas en el listado:', syllableAnalysis);
            
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras con pinyin`);
            return true;
            
        } catch (error) {
            console.error('Error cargando vocabulario:', error);
            
            this.vocabulary = [
                { ch: "你好", pin: "nǐ hǎo", en: "hello", es: "hola" },
                { ch: "谢谢", pin: "xièxie", en: "thank you", es: "gracias" },
                { ch: "小", pin: "xiǎo", en: "small", es: "pequeño" },
                { ch: "大", pin: "dà", en: "big", es: "grande" },
                { ch: "中国", pin: "zhōng guó", en: "China", es: "China" },
                { ch: "美国", pin: "měi guó", en: "USA", es: "EEUU" },
                { ch: "老师", pin: "lǎo shī", en: "teacher", es: "profesor" },
                { ch: "学生", pin: "xué shēng", en: "student", es: "estudiante" }
            ].filter(item => item.pin);
            
            if (this.ui) {
                this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            }
            
            return true;
        }
    }

    // Método auxiliar para analizar la distribución de sílabas
    analyzeSyllables() {
        const analysis = {};
        this.vocabulary.forEach(word => {
            if (word.pin) {
                const syllables = this.countSyllables(word.pin);
                analysis[syllables] = (analysis[syllables] || 0) + 1;
            }
        });
        return analysis;
    }
}
