// js/settings.js
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            bgColor: '#000000',
            clockTextColor: '#FFE4B5',
            accentColor: '#979595',
            fontFamily: "'Roboto', sans-serif"
        };
        
        this.loadSettings();
    }
    
    loadSettings() {
        const stored = localStorage.getItem('clockAppSettings');
        if (stored) {
            this.settings = {...this.defaultSettings, ...JSON.parse(stored)};
        } else {
            this.settings = {...this.defaultSettings};
        }
        
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('clockAppSettings', JSON.stringify(this.settings));
        this.applySettings();
    }
    
    applySettings() {
        document.documentElement.style.setProperty('--clock-bg', this.settings.bgColor);
        document.documentElement.style.setProperty('--clock-text', this.settings.clockTextColor);
        document.documentElement.style.setProperty('--accent-color', this.settings.accentColor);
        
        // Aplicar fuente seleccionada
        const clockDisplays = document.querySelectorAll('.clock-display');
        clockDisplays.forEach(display => {
            if (this.settings.fontFamily.includes('Digital')) {
                display.classList.add('clock-font-digital');
            } else {
                display.classList.remove('clock-font-digital');
                display.style.fontFamily = this.settings.fontFamily;
            }
        });
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    resetToDefaults() {
        this.settings = {...this.defaultSettings};
        this.saveSettings();
    }
    
    getSettings() {
        return {...this.settings};
    }
}
