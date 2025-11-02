// game4.js

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
        
        // Diccionario de imágenes por palabra clave en inglés/español
        this.imageKeywords = {
            // Animales
            'cat': '🐱', 'dog': '🐶', 'panda': '🐼', 'tiger': '🐯', 'lion': '🦁',
            'bird': '🐦', 'fish': '🐟', 'elephant': '🐘', 'monkey': '🐵', 'horse': '🐴',
            'cow': '🐮', 'pig': '🐷', 'frog': '🐸', 'bear': '🐻', 'rabbit': '🐰',
            
            // Comida
            'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'grape': '🍇', 'watermelon': '🍉',
            'bread': '🍞', 'rice': '🍚', 'noodle': '🍜', 'pizza': '🍕', 'hamburger': '🍔',
            'egg': '🥚', 'cake': '🍰', 'ice cream': '🍦', 'coffee': '☕', 'tea': '🍵',
            
            // Objetos
            'book': '📚', 'pen': '🖊️', 'pencil': '✏️', 'computer': '💻', 'phone': '📱',
            'house': '🏠', 'car': '🚗', 'bicycle': '🚲', 'train': '🚆', 'plane': '✈️',
            'clock': '⏰', 'key': '🔑', 'money': '💰', 'ball': '⚽', 'gift': '🎁',
            
            // Naturaleza
            'tree': '🌳', 'flower': '🌸', 'sun': '☀️', 'moon': '🌙', 'star': '⭐',
            'water': '💧', 'fire': '🔥', 'mountain': '⛰️', 'sea': '🌊', 'cloud': '☁️',
            
            // Personas y acciones
            'person': '👤', 'family': '👪', 'friend': '👫', 'teacher': '👨‍🏫', 'student': '👩‍🎓',
            'run': '🏃', 'swim': '🏊', 'eat': '🍽️', 'drink': '🥤', 'sleep': '😴',
            
            // Colores
            'red': '🔴', 'blue': '🔵', 'green': '🟢', 'yellow': '🟡', 'black': '⚫', 'white': '⚪',
            
            // Ropa
            'shirt': '👕', 'pants': '👖', 'shoe': '👟', 'hat': '🧢', 'glasses': '👓',
            
            // Emociones
            'happy': '😊', 'sad': '😢', 'angry': '😠', 'surprised': '😲', 'love': '❤️'
        };
        
        // Mapeo de palabras chinas comunes a emojis
        this.chineseToEmoji = {
            '猫': '🐱', '狗': '🐶', '熊猫': '🐼', '老虎': '🐯', '狮子': '🦁',
            '鸟': '🐦', '鱼': '🐟', '大象': '🐘', '猴子': '🐵', '马': '🐴',
            '牛': '🐮', '猪': '🐷', '青蛙': '🐸', '熊': '🐻', '兔子': '🐰',
            '苹果': '🍎', '香蕉': '🍌', '橙子': '🍊', '葡萄': '🍇', '西瓜': '🍉',
            '面包': '🍞', '米饭': '🍚', '面条': '🍜', '披萨': '🍕', '汉堡': '🍔',
            '鸡蛋': '🥚', '蛋糕': '🍰', '冰淇淋': '🍦', '咖啡': '☕', '茶': '🍵',
            '书': '📚', '笔': '🖊️', '铅笔': '✏️', '电脑': '💻', '手机': '📱',
            '房子': '🏠', '汽车': '🚗', '自行车': '🚲', '火车': '🚆', '飞机': '✈️',
            '钟': '⏰', '钥匙': '🔑', '钱': '💰', '球': '⚽', '礼物': '🎁',
            '树': '🌳', '花': '🌸', '太阳': '☀️', '月亮': '🌙', '星星': '⭐',
            '水': '💧', '火': '🔥', '山': '⛰️', '海': '🌊', '云': '☁️',
            '人': '👤', '家庭': '👪', '朋友': '👫', '老师': '👨‍🏫', '学生': '👩‍🎓',
            '跑': '🏃', '游泳': '🏊', '吃': '🍽️', '喝': '🥤', '睡觉': '😴',
            '红色': '🔴', '蓝色': '🔵', '绿色': '🟢', '黄色': '🟡', '黑色': '⚫', '白色': '⚪',
            '衬衫': '👕', '裤子': '👖', '鞋子': '👟', '帽子': '🧢', '眼镜': '👓',
            '高兴': '😊', '悲伤': '😢', '生气': '😠', '惊讶': '😲', '爱': '❤️',
            '你好': '👋', '谢谢': '🙏', '是': '✅', '不': '❌', '好': '👍', '坏': '👎'
        };
    }

    startGame() {
        if (!this.vocabulary.length) {
            this.ui.showToast('Primero selecciona un listado de vocabulario', 'error');
            this.ui.showScreen('lists-screen');
            return;
        }
        
        this.currentGame = 'game4';
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
        
        if (!this.currentWord.ch) {
            console.warn('Palabra sin caracteres chinos, buscando otra...');
            this.nextQuestion();
            return;
        }
        
        const incorrectOptions = this.getIncorrectOptions(currentIndex);
        
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
        
        const incorrectOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        const availableWords = [];
        for (let i = 0; i < this.vocabulary.length; i++) {
            if (i !== correctIndex && !usedIndices.has(i) && this.vocabulary[i].ch) {
                availableWords.push({
                    word: this.vocabulary[i],
                    index: i
                });
                if (availableWords.length >= numOptions + 10) break;
            }
        }
        
        this.shuffleArray(availableWords);
        for (let i = 0; i < Math.min(numOptions, availableWords.length); i++) {
            incorrectOptions.push(availableWords[i].word);
        }
        
        console.log(`Opciones incorrectas generadas: ${incorrectOptions.length} de ${numOptions} requeridas`);
        
        return incorrectOptions;
    }

    getEmojiForWord(word) {
        // Primero intentar con el mapeo directo de caracteres chinos
        if (this.chineseToEmoji[word.ch]) {
            return this.chineseToEmoji[word.ch];
        }
        
        // Buscar en las traducciones en inglés
        if (word.en) {
            const englishWords = word.en.toLowerCase().split(/\s+/);
            for (const engWord of englishWords) {
                if (this.imageKeywords[engWord]) {
                    return this.imageKeywords[engWord];
                }
            }
        }
        
        // Buscar en las traducciones en español
        if (word.es) {
            const spanishWords = word.es.toLowerCase().split(/\s+/);
            for (const espWord of spanishWords) {
                if (this.imageKeywords[espWord]) {
                    return this.imageKeywords[espWord];
                }
            }
        }
        
        // Emoji por defecto basado en el primer carácter
        const defaultEmojis = ['📝', '🔤', '💬', '🗣️', '📚', '🎯', '🔍', '✨', '🌟', '💫'];
        const randomIndex = Math.floor(Math.random() * defaultEmojis.length);
        return defaultEmojis[randomIndex];
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
        
        const instructionElement = document.createElement('div');
        instructionElement.className = 'instruction-text';
        instructionElement.textContent = 'Selecciona la imagen correcta:';
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
            button.style.padding = '1rem';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.minHeight = '120px';
            
            const emojiElement = document.createElement('div');
            emojiElement.className = 'emoji-option';
            emojiElement.textContent = this.getEmojiForWord(option);
            emojiElement.style.fontSize = '4rem';
            emojiElement.style.textAlign = 'center';
            
            button.appendChild(emojiElement);
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
            const emojiText = btn.querySelector('.emoji-option').textContent;
            const isThisCorrectOption = emojiText === this.getEmojiForWord(correctWord);
            const isThisSelectedOption = emojiText === this.getEmojiForWord(selectedOption);
            
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
                const emojiText = btn.querySelector('.emoji-option').textContent;
                const isThisCorrectOption = emojiText === this.getEmojiForWord(this.currentWord);
                
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
            
            this.vocabulary = data.filter(item => item.ch && item.ch.trim() !== '');
            
            if (this.vocabulary.length === 0) {
                throw new Error('No hay palabras con caracteres chinos en este listado');
            }
            
            console.log(`Listado "${filename}" cargado: ${this.vocabulary.length} palabras con caracteres chinos`);
            
            // Análisis de cobertura de emojis
            let emojiCoverage = 0;
            this.vocabulary.forEach(word => {
                if (this.chineseToEmoji[word.ch] || 
                    (word.en && this.hasMatchingEmoji(word.en)) ||
                    (word.es && this.hasMatchingEmoji(word.es))) {
                    emojiCoverage++;
                }
            });
            
            console.log(`Cobertura de emojis: ${emojiCoverage}/${this.vocabulary.length} (${Math.round(emojiCoverage/this.vocabulary.length*100)}%)`);
            
            return true;
            
        } catch (error) {
            console.error('Error cargando vocabulario:', error);
            
            this.vocabulary = [
                { ch: "猫", pin: "māo", en: "cat", es: "gato" },
                { ch: "狗", pin: "gǒu", en: "dog", es: "perro" },
                { ch: "苹果", pin: "píngguǒ", en: "apple", es: "manzana" },
                { ch: "书", pin: "shū", en: "book", es: "libro" },
                { ch: "水", pin: "shuǐ", en: "water", es: "agua" },
                { ch: "火", pin: "huǒ", en: "fire", es: "fuego" },
                { ch: "树", pin: "shù", en: "tree", es: "árbol" },
                { ch: "房子", pin: "fángzi", en: "house", es: "casa" },
                { ch: "汽车", pin: "qìchē", en: "car", es: "coche" },
                { ch: "电话", pin: "diànhuà", en: "phone", es: "teléfono" }
            ].filter(item => item.ch);
            
            if (this.ui) {
                this.ui.showToast(`No se pudo cargar "${filename}". Usando datos de ejemplo.`, 'error');
            }
            
            return true;
        }
    }

    hasMatchingEmoji(text) {
        if (!text) return false;
        const words = text.toLowerCase().split(/\s+/);
        return words.some(word => this.imageKeywords[word]);
    }
}
