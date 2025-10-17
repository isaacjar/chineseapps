// js/ui.js - Versión corregida
class UIManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.currentScreen = 'menu-screen';
        this.initEventListeners();
    }
    
    initEventListeners() {
        // ... (otros event listeners se mantienen igual)
        
        // Configuración de la aplicación
        this.setupSettingsForm();
    }
    
    setupSettingsForm() {
        const bgColorInput = document.getElementById('bg-color');
        const clockTextColorInput = document.getElementById('clock-text-color');
        const accentColorInput = document.getElementById('accent-color');
        const fontFamilySelect = document.getElementById('font-family');
        const saveBtn = document.getElementById('save-settings');
        const resetBtn = document.getElementById('reset-settings');
        
        // Guardar configuración manualmente
        saveBtn.addEventListener('click', () => {
            // Obtener valores actuales del formulario
            const formSettings = this.settingsManager.getFormSettings();
            
            // Actualizar cada setting individualmente
            Object.entries(formSettings).forEach(([key, value]) => {
                this.settingsManager.updateSetting(key, value);
            });
            
            // Guardar en localStorage
            this.settingsManager.saveCurrentSettings();
        });
        
        // Resetear a valores por defecto
        resetBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres restablecer todos los valores a los predeterminados?')) {
                this.settingsManager.resetToDefaults();
                this.populateSettingsForm();
            }
        });
        
        // Opcional: Aplicar cambios en tiempo real mientras se modifican
        // (comenta estas líneas si prefieres solo guardar con el botón)
        /*
        bgColorInput.addEventListener('change', (e) => {
            this.settingsManager.updateSetting('bgColor', e.target.value);
        });
        
        clockTextColorInput.addEventListener('change', (e) => {
            this.settingsManager.updateSetting('clockTextColor', e.target.value);
        });
        
        accentColorInput.addEventListener('change', (e) => {
            this.settingsManager.updateSetting('accentColor', e.target.value);
        });
        
        fontFamilySelect.addEventListener('change', (e) => {
            this.settingsManager.updateSetting('fontFamily', e.target.value);
        });
        */
    }
    
    populateSettingsForm() {
        const settings = this.settingsManager.getSettings();
        
        document.getElementById('bg-color').value = settings.bgColor;
        document.getElementById('clock-text-color').value = settings.clockTextColor;
        document.getElementById('accent-color').value = settings.accentColor;
        document.getElementById('font-family').value = settings.fontFamily;
    }
    
    updateClockDisplay(elementId, timeString) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = timeString;
        }
    }
    
    updateTargetTimeDisplay(timeString) {
        const element = document.getElementById('target-time-display');
        if (element) {
            element.textContent = `Hasta: ${timeString}`;
        }
    }
}
