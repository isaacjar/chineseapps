class UI {
    constructor(settings, game) {
        this.settings = settings;
        this.game = game;
        this.labels = LABELS; // Usar las etiquetas del archivo externo
        this.vocabLists = [];
        
        this.setupEventListeners();
        this.loadVocabLists();
        this.updateLabels(); // Actualizar las etiquetas inmediatamente
    }
    
    updateLabels() {
        const lang = this.settings.get('language');
        const currentLabels = this.labels[lang];
        
        if (!currentLabels) {
            console.error('No se encontraron etiquetas para el idioma:', lang);
            return;
        }
        
        // Actualizar título de la app
        document.getElementById('app-title').textContent = currentLabels.appTitle;
        
        // Actualizar menú
        document.querySelector('#vocab-lists-btn .menu-text').textContent = currentLabels.menu.vocabLists;
        document.querySelector('#game1-btn .menu-text').textContent = currentLabels.menu.game1;
        document.querySelector('#game2-btn .menu-text').textContent = currentLabels.menu.game2;
        document.querySelector('#stats-btn .menu-text').textContent = currentLabels.menu.stats;
        
        // Actualizar pantalla de listados
        document.querySelector('#lists-screen h2').textContent = currentLabels.lists.title;
        document.getElementById('close-lists-btn').textContent = currentLabels.lists.close;
        
        // Actualizar pantalla de configuración
        document.querySelector('#settings-screen h2').textContent = currentLabels.settings.title;
        document.querySelector('#settings-screen label[for="language-select"]').textContent = currentLabels.settings.language;
        document.querySelector('#settings-screen label[for="questions-slider"]').textContent = currentLabels.settings.questions;
        document.querySelector('#settings-screen label[for="time-slider"]').textContent = currentLabels.settings.time;
        document.querySelector('#settings-screen label[for="lives-select"]').textContent = currentLabels.settings.lives;
        document.querySelector('#settings-screen label[for="difficulty-slider"]').textContent = currentLabels.settings.difficulty;
        document.getElementById('save-settings-btn').textContent = currentLabels.settings.save;
        document.getElementById('reset-settings-btn').textContent = currentLabels.settings.reset;
        document.getElementById('cancel-settings-btn').textContent = currentLabels.settings.cancel;
        
        // Actualizar pantalla de estadísticas
        document.querySelector('#stats-screen h2').textContent = currentLabels.stats.title;
        document.querySelector('.stat-item:nth-child(1) .stat-label').textContent = currentLabels.stats.wordsShown;
        document.querySelector('.stat-item:nth-child(2) .stat-label').textContent = currentLabels.stats.correctAnswers;
        document.querySelector('.stat-item:nth-child(3) .stat-label').textContent = currentLabels.stats.accuracy;
        document.getElementById('reset-stats-btn').textContent = currentLabels.stats.reset;
        document.getElementById('close-stats-btn').textContent = currentLabels.stats.close;
    }
    
    // ... el resto del código permanece igual ...
    async loadVocabLists() {
        try {
            // En lugar de cargar el archivo index.js, vamos a definir los listados manualmente
            // o usar una API si está disponible
            this.vocabLists = [
                { filename: "H1L1", title: "HSK 1 Lesson 1", level: "H1", misc: "MIT" },
                { filename: "H1L2", title: "HSK 1 Lesson 2", level: "H1", misc: "MIT" },
                { filename: "H1L3", title: "HSK 1 Lesson 3", level: "H1", misc: "MIT" },
                { filename: "H2L1", title: "HSK 2 Lesson 1", level: "H2", misc: "MIT" },
                { filename: "H2L2", title: "HSK 2 Lesson 2", level: "H2", misc: "MIT" }
            ];
            this.displayVocabLists();
        } catch (error) {
            console.error('Error cargando listados de vocabulario:', error);
            // Listados de ejemplo como fallback
            this.vocabLists = [
                { filename: "H1L1", title: "HSK 1 Lesson 1", level: "H1", misc: "MIT" },
                { filename: "H1L2", title: "HSK 1 Lesson 2", level: "H1", misc: "MIT" }
            ];
            this.displayVocabLists();
        }
    }
    
    showRandomSuccessMessage() {
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].successMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'success');
    }
    
    showRandomFailMessage() {
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].failMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'error');
    }
    
    // ... resto del código ...
}
