// app.js - Arranque y manejo general de la aplicación
class HSKBambooApp {
    constructor() {
        this.currentScreen = 'menu';
        this.vocabulary = [];
        this.languageData = {};
        this.settings = {
            language: 'en',
            questions: 15,
            time: 10,
            lives: 3,
            showPinyin: false,
            hskLevels: [1, 2, 3, 4], // Niveles por defecto
            difficulty: 1
        };
        
        this.init();
    }
    
    async init() {
        // Cargar vocabulario y datos de idioma
        await this.loadData();
        
        // Cargar configuración
        this.loadSettings();
        
        // Aplicar configuración de URL si existe
        this.applyUrlSettings();
        
        // Inicializar interfaz de usuario
        this.initUI();
        
        // Inicializar juego
        this.initGame();
        
        // Mostrar pantalla inicial
        UI.showScreen('menu');
    }
    
    async loadData() {
        try {
            // Cargar vocabulario
            const vocabResponse = await fetch('js/voclist.json');
            this.vocabulary = await vocabResponse.json();
            
            // Cargar estadísticas si existen
            const savedStats = localStorage.getItem('hskBambooStats');
            if (savedStats) {
                const statsData = JSON.parse(savedStats);
                this.vocabulary.forEach((word, index) => {
                    const savedWord = statsData.find(w => w.ch === word.ch);
                    if (savedWord) {
                        word.s = savedWord.s || 0;
                        word.e = savedWord.e || 0;
                    }
                });
            }
                
            // Cargar datos de idioma
            const langResponse = await fetch('js/lang.json');
            this.languageData = await langResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
            // Datos de respaldo en caso de error
                this.languageData = {
                    en: {
                        settingsSaved: "Settings saved successfully!",
                        timeOut: "Time's up!",
                        gameOver: "Game Over", 
                        gameCompleted: "Game completed",
                        menuReturn: "Returning to menu",
                        successMessages: {
                            "s1": "🐼 Awesome!",
                            "s2": "🎉 Correct!",
                            // ... resto de mensajes ...
                        },
                        failMessages: {
                            "f1": "😅 Oops, almost...",
                            // ... resto de mensajes ...
                        }
                    },
                    es: {
                        // ... datos en español ...
                    }
                };
            }
        }
    
    
    loadSettings() {
        const savedSettings = localStorage.getItem('hskBambooSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        // Aplicar configuración a la UI
        SettingsUI.updateUIFromSettings(this.settings);
    }
    
    applyUrlSettings() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('lang')) this.settings.language = urlParams.get('lang');
        if (urlParams.has('questions')) this.settings.questions = parseInt(urlParams.get('questions'));
        if (urlParams.has('time')) this.settings.time = parseInt(urlParams.get('time'));
        if (urlParams.has('lives')) this.settings.lives = parseInt(urlParams.get('lives'));
        if (urlParams.has('difficulty')) this.settings.difficulty = parseInt(urlParams.get('difficulty'));
        if (urlParams.has('showPinyin')) this.settings.showPinyin = urlParams.get('showPinyin') === 'true';
        
        // Procesar niveles HSK desde URL
        if (urlParams.has('hskLevels')) {
            const hskLevelsParam = urlParams.get('hskLevels');
            this.settings.hskLevels = hskLevelsParam.split(',').map(Number);
        }
        
        if (urlParams.has('voclist')) {
            console.log("Vocabulario personalizado solicitado:", urlParams.get('voclist'));
        }
    }
    
    initUI() {
        // Inicializar listeners de botones
        document.getElementById('settings-btn').addEventListener('click', () => {
            UI.showScreen('settings');
        });
        
        // Listener del logo 🎋
        document.getElementById('logo-btn').addEventListener('click', () => {
            this.goToMainMenu();
        });
        
        document.getElementById('vocab-list-btn').addEventListener('click', () => {
            UI.showScreen('review');
            this.loadReviewList();
        });
        
        document.getElementById('game1-btn').addEventListener('click', () => {
            Game.startGame(1, this.settings, this.vocabulary);
        });
        
        document.getElementById('game2-btn').addEventListener('click', () => {
            Game.startGame(2, this.settings, this.vocabulary);
        });
        
        document.getElementById('stats-btn').addEventListener('click', () => {
            UI.showScreen('stats');
        });

        document.getElementById('time-slider').addEventListener('input', (e) => {
            document.getElementById('time-value').textContent = e.target.value;
        });
        
        document.getElementById('lives-slider').addEventListener('input', (e) => {
            document.getElementById('lives-value').textContent = e.target.value;
        });
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            SettingsUI.resetSettings();
        });
        
        document.getElementById('cancel-settings').addEventListener('click', () => {
            UI.showScreen('menu');
        });
        
        document.getElementById('back-from-review').addEventListener('click', () => {
            UI.showScreen('menu');
        });

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                this.loadReviewList();
            });
        });
        
        document.getElementById('back-from-stats').addEventListener('click', () => {
            UI.showScreen('menu');
        });
        
        // Listeners para sliders
        document.getElementById('questions-slider').addEventListener('input', (e) => {
            document.getElementById('questions-value').textContent = e.target.value;
        });
        
        document.getElementById('time-slider').addEventListener('input', (e) => {
            document.getElementById('time-value').textContent = e.target.value;
        });
        
        document.getElementById('difficulty-switch').addEventListener('change', (e) => {
            const emoji = e.target.checked ? '🥵' : '😎';
            document.getElementById('difficulty-emoji').textContent = emoji;
        });

        document.getElementById('lives-slider').addEventListener('input', (e) => {
            document.getElementById('lives-value').textContent = e.target.value;
        });
    }
    
    initGame() {
        // Inicializar el sistema de juego
        Game.init(this.vocabulary, this.languageData);
    }
    
    saveSettings() {
        // Obtener valores de la UI
        this.settings.language = document.getElementById('language-select').value;
        this.settings.questions = parseInt(document.getElementById('questions-slider').value);
        this.settings.time = parseInt(document.getElementById('time-slider').value);
        this.settings.lives = parseInt(document.getElementById('lives-slider').value);
        this.settings.showPinyin = document.getElementById('show-pinyin').checked;
        this.settings.difficulty = document.getElementById('difficulty-switch').checked ? 2 : 1;
        
        // Obtener niveles HSK seleccionados
        this.settings.hskLevels = [];
        if (document.getElementById('hsk-level-1').checked) this.settings.hskLevels.push(1);
        if (document.getElementById('hsk-level-2').checked) this.settings.hskLevels.push(2);
        if (document.getElementById('hsk-level-3').checked) this.settings.hskLevels.push(3);
        if (document.getElementById('hsk-level-4').checked) this.settings.hskLevels.push(4);
        if (document.getElementById('hsk-level-4plus').checked) this.settings.hskLevels.push(5);
        
        // Guardar en localStorage
        localStorage.setItem('hskBambooSettings', JSON.stringify(this.settings));
        
        // Volver al menú
        UI.showScreen('menu');
        
        // Mostrar mensaje de confirmación
        UI.showToast(this.languageData[this.settings.language]?.settingsSaved || 'Configuración guardada');
    }
    
    loadReviewList() {  
         const filters = {
            vistas: document.querySelector('[data-filter="vistas"]').classList.contains('active'),
            h1: document.querySelector('[data-filter="h1"]').classList.contains('active'),
            h2: document.querySelector('[data-filter="h2"]').classList.contains('active'),
            h3: document.querySelector('[data-filter="h3"]').classList.contains('active'),
            h4: document.querySelector('[data-filter="h4"]').classList.contains('active'),
            h4plus: document.querySelector('[data-filter="h4plus"]').classList.contains('active')
        };
    
        const wordsToReview = this.vocabulary.filter(word => {
            if (filters.vistas && word.s > 0) return true;
            if (filters.h1 && word.level === 1) return true;
            if (filters.h2 && word.level === 2) return true;
            if (filters.h3 && word.level === 3) return true;
            if (filters.h4 && word.level === 4) return true;
            if (filters.h4plus && word.level >= 5) return true;
            return false;
        }).map(word => ({
            ...word,
            errorRate: word.s > 0 ? (word.e / word.s * 100) : 0
        })).sort((a, b) => b.errorRate - a.errorRate);
           
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';
        
        if (wordsToReview.length === 0) {
            reviewList.innerHTML = '<p>No hay palabras para repasar todavía. ¡Juega para generarlas!</p>';
            return;
        }
        
        wordsToReview.forEach(word => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                <div class="review-word">${word.ch} (${word.pin}) - ${word[this.settings.language]}</div>
                <div class="review-stats">Mostrada: ${word.s} veces, Errores: ${word.e} (${word.errorRate.toFixed(1)}%)</div>
            `;
            reviewList.appendChild(item);
        });
    }

    goToMainMenu() {
        // Detener cualquier juego en curso
        if (Game.currentGame) {
            clearTimeout(Game.timer);
            Game.currentGame = null;
        }
        
        // Ocultar estadísticas y mostrar botón de configuración
        UI.showGameHeader(false);
        
        // Mostrar pantalla de menú
        UI.showScreen('menu');
        
        // Mostrar mensaje de confirmación
        //UI.showToast(this.languageData[this.settings.language]?.menuReturn || 'Back to menu');
    }
}
// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HSKBambooApp();
});
