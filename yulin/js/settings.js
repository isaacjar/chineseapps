class Settings {
    constructor() {
        this.defaultSettings = {
            language: 'en',
            questions: 15,
            time: 10,
            lives: 3,
            difficulty: 1,
            currentVocabList: null
        };
        
        this.loadSettings();
        this.applyUrlParameters();
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('yulin-settings');
        if (savedSettings) {
            this.settings = {...this.defaultSettings, ...JSON.parse(savedSettings)};
        } else {
            this.settings = {...this.defaultSettings};
        }
    }
    
    saveSettings() {
        localStorage.setItem('yulin-settings', JSON.stringify(this.settings));
    }
    
    applyUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('lang')) {
            this.settings.language = urlParams.get('lang');
        }
        if (urlParams.has('questions')) {
            this.settings.questions = parseInt(urlParams.get('questions'));
        }
        if (urlParams.has('time')) {
            this.settings.time = parseInt(urlParams.get('time'));
        }
        if (urlParams.has('difficulty')) {
            this.settings.difficulty = parseInt(urlParams.get('difficulty'));
        }
        if (urlParams.has('voclist')) {
            this.settings.currentVocabList = urlParams.get('voclist');
        }
    }
    
    get(key) {
        return this.settings[key];
    }
    
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    reset() {
        this.settings = {...this.defaultSettings};
        this.saveSettings();
    }
    
    updateUI() {
        // Actualizar elementos de la UI según la configuración actual
        document.getElementById('language-select').value = this.settings.language;
        document.getElementById('questions-slider').value = this.settings.questions;
        document.getElementById('questions-value').textContent = this.settings.questions;
        document.getElementById('time-slider').value = this.settings.time;
        document.getElementById('time-value').textContent = this.settings.time;
        document.getElementById('lives-select').value = this.settings.lives;
        document.getElementById('difficulty-slider').value = this.settings.difficulty;
        this.updateDifficultyEmoji();
    }
    
    updateDifficultyEmoji() {
        const emoji = this.settings.difficulty === 1 ? '😎' : '🥵';
        document.getElementById('difficulty-emoji').textContent = emoji;
    }
}
