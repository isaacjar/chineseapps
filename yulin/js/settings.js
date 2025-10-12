class Settings {
    constructor() {
        this.defaultSettings = {
            language: 'en',
            questions: 15,
            time: 10,
            lives: 3,
            difficulty: 1,
            showPinyin: true // Nueva configuración para mostrar pinyin
        };
        
        this.loadSettings();
        this.applyUrlParameters();
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('yulin-settings');
        if (savedSettings) {
            const { currentVocabList, ...savedSettingsWithoutVocab } = JSON.parse(savedSettings);
            this.settings = {...this.defaultSettings, ...savedSettingsWithoutVocab};
        } else {
            this.settings = {...this.defaultSettings};
        }
    }
    
    saveSettings() {
        const { currentVocabList, ...settingsToSave } = this.settings;
        localStorage.setItem('yulin-settings', JSON.stringify(settingsToSave));
    }
    
    applyUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('lang')) this.settings.language = urlParams.get('lang');
        if (urlParams.has('questions')) this.settings.questions = parseInt(urlParams.get('questions'));
        if (urlParams.has('time')) this.settings.time = parseInt(urlParams.get('time'));
        if (urlParams.has('difficulty')) this.settings.difficulty = parseInt(urlParams.get('difficulty'));
        if (urlParams.has('pinyin')) this.settings.showPinyin = urlParams.get('pinyin') === 'true';
    }
    
    get(key) {
        return this.settings[key];
    }
    
    set(key, value) {
        this.settings[key] = value;
        if (key !== 'currentVocabList') this.saveSettings();
    }
    
    reset() {
        this.settings = {...this.defaultSettings};
        this.saveSettings();
    }
    
    updateUI() {
        // Idioma
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = this.settings.language;
        
        // Número de preguntas
        const questionsSlider = document.getElementById('questions-slider');
        const questionsValue = document.getElementById('questions-value');
        if (questionsSlider) questionsSlider.value = this.settings.questions;
        if (questionsValue) questionsValue.textContent = this.settings.questions;
        
        // Tiempo por pregunta
        const timeSlider = document.getElementById('time-slider');
        const timeValue = document.getElementById('time-value');
        if (timeSlider) timeSlider.value = this.settings.time;
        if (timeValue) timeValue.textContent = `${this.settings.time} s.`;
        
        // Número de vidas
        const livesSlider = document.getElementById('lives-slider');
        const livesValue = document.getElementById('lives-value');
        if (livesSlider) livesSlider.value = this.settings.lives;
        if (livesValue) livesValue.textContent = this.settings.lives;
        
        // Dificultad
        const difficultySwitch = document.getElementById('difficulty-switch');
        if (difficultySwitch) difficultySwitch.checked = this.settings.difficulty === 2;
        
        // Mostrar Pinyin
        const pinyinSwitch = document.getElementById('pinyin-switch');
        if (pinyinSwitch) pinyinSwitch.checked = this.settings.showPinyin;
        
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
