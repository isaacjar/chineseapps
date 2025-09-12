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
        document.getElementById('show-pinyin').checked = settings.showPinyin;
        
        document.getElementById('hsk-level-1').checked = settings.hskLevels.includes(1);        
        document.getElementById('hsk-level-2').checked = settings.hskLevels.includes(2);
        document.getElementById('hsk-level-3').checked = settings.hskLevels.includes(3);
        document.getElementById('hsk-level-4').checked = settings.hskLevels.includes(4);
        document.getElementById('hsk-level-4plus').checked = settings.hskLevels.includes(5);
        
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
            showPinyin: false,
            hskLevels: [1, 2, 3, 4],
            difficulty: 1
        };
        
        this.updateUIFromSettings(defaultSettings);
    }
    
    static getSettingsFromUI() {
        const hskLevels = [];
        if (document.getElementById('hsk-level-1').checked) hskLevels.push(1);
        if (document.getElementById('hsk-level-2').checked) hskLevels.push(2);
        if (document.getElementById('hsk-level-3').checked) hskLevels.push(3);
        if (document.getElementById('hsk-level-4').checked) hskLevels.push(4);
        if (document.getElementById('hsk-level-4plus').checked) hskLevels.push(5);
        return {
            language: document.getElementById('language-select').value,
            questions: parseInt(document.getElementById('questions-slider').value),
            time: parseInt(document.getElementById('time-slider').value),
            lives: parseInt(document.getElementById('lives-slider').value),
            showPinyin: document.getElementById('show-pinyin').checked,
            hskLevels: hskLevels,
            difficulty: document.getElementById('difficulty-switch').checked ? 2 : 1
        };
    }
}
