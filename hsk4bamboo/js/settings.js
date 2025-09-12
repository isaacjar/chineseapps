// settings.js - Manejo de configuración y localStorage
class SettingsUI {
    static updateUIFromSettings(settings) {
        document.getElementById('language-select').value = settings.language;
        document.getElementById('questions-slider').value = settings.questions;
        document.getElementById('questions-value').textContent = settings.questions;
        document.getElementById('time-slider').value = settings.time;
        document.getElementById('time-value').textContent = settings.time;
        document.getElementById('lives-slider').value = settings.lives;
        document.getElementById('lives-value').textContent = settings.lives;
        
        document.getElementById('difficulty-switch').checked = settings.difficulty === 2;
        const emoji = settings.difficulty === 2 ? '🥵' : '😎';
        document.getElementById('difficulty-emoji').textContent = emoji;
    }
    
    static resetSettings() {
        const defaultSettings = {
            language: 'en',
            questions: 15,
            time: 10,
            lives: 3,
            difficulty: 1
        };
        
        this.updateUIFromSettings(defaultSettings);
    }
    
    static getSettingsFromUI() {
        return {
            language: document.getElementById('language-select').value,
            questions: parseInt(document.getElementById('questions-slider').value),
            time: parseInt(document.getElementById('time-slider').value),
            lives: parseInt(document.getElementById('lives-slider').value),
            difficulty: document.getElementById('difficulty-switch').checked ? 2 : 1
        };
    }
}
