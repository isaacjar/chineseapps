// js/settings.js - Versión corregida con toggle de horas
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            bgColor: '#000000',
            clockTextColor: '#FFE4B5',
            accentColor: '#979595',
            fontFamily: "'Orbitron', monospace",
            fontClass: 'clock-font-orbitron',
            showHours: false // Por defecto SIN horas
        };
        
        this.fontMap = {
            // Fuentes digitales de Google Fonts (CONFIABLES)
            "'Orbitron', monospace": "clock-font-orbitron",
            "'Share Tech Mono', monospace": "clock-font-share-tech",
            
            // Digital-7 (opcional, para quienes prefieren el clásico)
            "'Digital-7', monospace": "clock-font-digital-7",
            
            // Fuentes estándar
            "'Roboto', sans-serif": "clock-font-roboto",
            "'Arial', sans-serif": "clock-font-arial", 
            "'Helvetica', sans-serif": "clock-font-helvetica",
            "'Georgia', serif": "clock-font-georgia",
            "'Times New Roman', serif": "clock-font-times",
            "'Courier New', monospace": "clock-font-courier",
            "'Verdana', sans-serif": "clock-font-verdana",
            "'Trebuchet MS', sans-serif": "clock-font-trebuchet",
            "'Gill Sans', sans-serif": "clock-font-gill"
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
        this.updateFormInputs();
    }
    
    saveSettings() {
        // Obtener valores actuales del formulario
        const formSettings = this.getFormSettings();
        this.currentSettings = {...this.currentSettings, ...formSettings};
        
        localStorage.setItem('clockAppSettings', JSON.stringify(this.currentSettings));
        this.applySettings();
        this.showSaveConfirmation();
        
        // Notificar a los managers que el formato de tiempo cambió
        this.notifyTimeFormatChange();
    }
    
    showSaveConfirmation() {
        const saveBtn = document.getElementById('save-settings');
        if (!saveBtn) return;
        
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
        
        clockDisplays.forEach(display => {
            Object.values(this.fontMap).forEach(fontClass => {
                display.classList.remove(fontClass);
            });
            display.classList.add(fontClass);
        });
    }
    
    // Actualizar inputs del formulario con la configuración actual
    updateFormInputs() {
        const bgColorInput = document.getElementById('bg-color');
        const clockTextColorInput = document.getElementById('clock-text-color');
        const accentColorInput = document.getElementById('accent-color');
        const fontFamilySelect = document.getElementById('font-family');
        const showHoursCheckbox = document.getElementById('show-hours');
        
        if (bgColorInput) bgColorInput.value = this.currentSettings.bgColor;
        if (clockTextColorInput) clockTextColorInput.value = this.currentSettings.clockTextColor;
        if (accentColorInput) accentColorInput.value = this.currentSettings.accentColor;
        if (fontFamilySelect) fontFamilySelect.value = this.currentSettings.fontFamily;
        if (showHoursCheckbox) showHoursCheckbox.checked = this.currentSettings.showHours;
    }
    
    updateSetting(key, value) {
        this.currentSettings[key] = value;
        
        if (key === 'fontFamily') {
            this.currentSettings.fontClass = this.fontMap[value] || 'clock-font-roboto';
        }
        
        this.applySettings();
        
        // Si cambia showHours, notificar a los managers
        if (key === 'showHours') {
            this.notifyTimeFormatChange();
        }
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
    
    // Método para obtener configuración del formulario (incluye showHours)
    getFormSettings() {
        const showHoursCheckbox = document.getElementById('show-hours');
        
        return {
            bgColor: document.getElementById('bg-color').value,
            clockTextColor: document.getElementById('clock-text-color').value,
            accentColor: document.getElementById('accent-color').value,
            fontFamily: document.getElementById('font-family').value,
            showHours: showHoursCheckbox ? showHoursCheckbox.checked : false
        };
    }
    
    // Método para obtener si se deben mostrar horas
    getShowHours() {
        return this.currentSettings.showHours;
    }
    
    // Notificar a los managers que el formato de tiempo cambió - CORREGIDO
   notifyTimeFormatChange() {
        console.log('Notificando cambio de formato de horas...');
        console.log('showHours actual:', this.getShowHours());
        
        // Comprobar que los managers existen y tienen el método updateDisplay
        if (window.stopwatchManager && typeof window.stopwatchManager.updateDisplay === 'function') {
            console.log('Actualizando stopwatch...');
            window.stopwatchManager.updateDisplay();
        }
        if (window.timerManager && typeof window.timerManager.updateDisplay === 'function') {
            console.log('Actualizando timer...');
            window.timerManager.updateDisplay();
        }
        if (window.countdownManager && typeof window.countdownManager.updateDisplay === 'function') {
            console.log('Actualizando countdown...');
            window.countdownManager.updateDisplay();
        }
    }
    
    // NUEVO: Método para aplicar cambios inmediatos sin guardar (para uso interno)
    applyImmediateChanges() {
        this.applySettings();
        this.notifyTimeFormatChange();
    }
}
