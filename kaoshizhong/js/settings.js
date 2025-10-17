// js/settings.js - Corregir el sistema de fuentes
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            bgColor: '#000000',
            clockTextColor: '#FFE4B5',
            accentColor: '#979595',
            fontFamily: "'Roboto', sans-serif",
            fontClass: 'clock-font-roboto'
        };
        
        this.fontMap = {
            "'Roboto', sans-serif": "clock-font-roboto",
            "'Arial', sans-serif": "clock-font-arial", 
            "'Helvetica', sans-serif": "clock-font-helvetica",
            "'Georgia', serif": "clock-font-georgia",
            "'Times New Roman', serif": "clock-font-times",
            "'Courier New', monospace": "clock-font-courier",
            "'Verdana', sans-serif": "clock-font-verdana",
            "'Trebuchet MS', sans-serif": "clock-font-trebuchet",
            "'Gill Sans', sans-serif": "clock-font-gill",
            "'Digital-7', monospace": "clock-font-digital"
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
        
        // Aplicar fuente seleccionada a todos los displays de reloj
        this.applyFontToAllClocks();
    }
    
    applyFontToAllClocks() {
        const clockDisplays = document.querySelectorAll('.clock-display');
        const fontClass = this.fontMap[this.settings.fontFamily] || 'clock-font-roboto';
        
        // Primero remover todas las clases de fuente
        clockDisplays.forEach(display => {
            Object.values(this.fontMap).forEach(fontClass => {
                display.classList.remove(fontClass);
            });
            // Añadir la clase de fuente seleccionada
            display.classList.add(fontClass);
        });
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Si cambia la fuente, actualizar también la clase
        if (key === 'fontFamily') {
            this.settings.fontClass = this.fontMap[value] || 'clock-font-roboto';
        }
        
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
