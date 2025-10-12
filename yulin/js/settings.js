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
        // Solo actualizar elementos que existen
        const languageSelect = document.getElementById('language-select');
        const questionsSlider = document.getElementById('questions-slider');
        const questionsValue = document.getElementById('questions-value');
        const timeSlider = document.getElementById('time-slider');
        const timeValue = document.getElementById('time-value');
        const livesSelect = document.getElementById('lives-select');
        const difficultySlider = document.getElementById('difficulty-slider');
        
        if (languageSelect) languageSelect.value = this.settings.language;
        if (questionsSlider) questionsSlider.value = this.settings.questions;
        if (questionsValue) questionsValue.textContent = this.settings.questions;
        if (timeSlider) timeSlider.value = this.settings.time;
        if (timeValue) timeValue.textContent = this.settings.time;
        if (livesSelect) livesSelect.value = this.settings.lives;
        if (difficultySlider) difficultySlider.value = this.settings.difficulty;
        
        this.updateDifficultyEmoji();
    }
    
    updateDifficultyEmoji() {
        const difficultyEmoji = document.getElementById('difficulty-emoji');
        if (difficultyEmoji) {
            const emoji = this.settings.difficulty === 1 ? '😎' : '🥵';
            difficultyEmoji.textContent = emoji;
        }
    }
}
