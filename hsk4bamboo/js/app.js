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
            
            // Cargar datos de idioma
            const langResponse = await fetch('js/lang.json');
            this.languageData = await langResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
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
        if (urlParams.has('difficulty')) this.settings.difficulty = parseInt(urlParams.get('difficulty'));
        if (urlParams.has('voclist')) {
            // En una implementación real, cargaríamos la lista de vocabulario especificada
            console.log("Vocabulario personalizado solicitado:", urlParams.get('voclist'));
        }
    }
    
    initUI() {
        // Inicializar listeners de botones
        document.getElementById('settings-btn').addEventListener('click', () => {
            UI.showScreen('settings');
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
        
        document.getElementById('difficulty-slider').addEventListener('input', (e) => {
            const emoji = e.target.value == 1 ? '😎' : '🥵';
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
        this.settings.lives = parseInt(document.getElementById('lives-input').value);
        this.settings.difficulty = parseInt(document.getElementById('difficulty-slider').value);
        
        // Guardar en localStorage
        localStorage.setItem('hskBambooSettings', JSON.stringify(this.settings));
        
        // Volver al menú
        UI.showScreen('menu');
        
        // Mostrar mensaje de confirmación
        UI.showToast(this.languageData[this.settings.language].settingsSaved || 'Configuración guardada');
    }
    
    loadReviewList() {
        // Filtrar palabras que han sido mostradas al menos una vez
        const wordsToReview = this.vocabulary
            .filter(word => word.s > 0)
            .map(word => ({
                ...word,
                errorRate: word.e / word.s * 100
            }))
            .sort((a, b) => b.errorRate - a.errorRate);
        
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
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HSKBambooApp();
});
