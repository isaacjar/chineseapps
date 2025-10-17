// js/settings.js - Añadir método para guardar manualmente
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
        
        this.currentSettings = {...this.defaultSettings};
        this.loadSettings();
    }
    
    loadSettings() {
        const stored = localStorage.getItem('clockAppSettings');
        if (stored) {
            this.currentSettings = {...this.defaultSettings, ...JSON.parse(stored)};
        } else {
            this.currentSettings = {...this.defaultSettings};
        }
        
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('clockAppSettings', JSON.stringify(this.currentSettings));
        this.applySettings();
        this.showSaveConfirmation();
    }
    
    showSaveConfirmation() {
        // Mostrar mensaje de confirmación temporal
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.textContent;
        
        saveBtn.textContent = '✓ Guardado!';
        saveBtn.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.backgroundColor = '';
        }, 2000);
    }
    
    applySettings() {
        document.documentElement.style.setProperty('--clock-bg', this.currentSettings.bgColor);
        document.documentElement.style.setProperty('--clock-text', this.currentSettings.clockTextColor);
        document.documentElement.style.setProperty('--accent-color', this.currentSettings.accentColor);
        
        // Aplicar fuente seleccionada a todos los displays de reloj
        this.applyFontToAllClocks();
    }
    
    applyFontToAllClocks() {
        const clockDisplays = document.querySelectorAll('.clock-display');
        const fontClass = this.fontMap[this.currentSettings.fontFamily] || 'clock-font-roboto';
        
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
        this.currentSettings[key] = value;
        
        // Si cambia la fuente, actualizar también la clase
        if (key === 'fontFamily') {
            this.currentSettings.fontClass = this.fontMap[value] || 'clock-font-roboto';
        }
        
        // Aplicar cambios inmediatamente (opcional)
        this.applySettings();
    }
    
    saveCurrentSettings() {
        this.saveSettings();
    }
    
    resetToDefaults() {
        this.currentSettings = {...this.defaultSettings};
        this.saveSettings();
    }
    
    getSettings() {
        return {...this.currentSettings};
    }
    
    // Nuevo método para obtener los valores actuales del formulario
    getFormSettings() {
        return {
            bgColor: document.getElementById('bg-color').value,
            clockTextColor: document.getElementById('clock-text-color').value,
            accentColor: document.getElementById('accent-color').value,
            fontFamily: document.getElementById('font-family').value
        };
    }
}
