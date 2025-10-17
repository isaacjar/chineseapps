// js/ui.js - Versión corregida
class UIManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.currentScreen = 'menu-screen';
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Navegación del menú principal - CORREGIDO
        document.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const targetScreen = e.currentTarget.getAttribute('data-screen');
                this.showScreen(targetScreen);
            });
        });
        
        // Botones de retroceso - CORREGIDO
        document.getElementById('back-from-clock').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        document.getElementById('back-from-stopwatch').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        document.getElementById('back-from-timer').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        document.getElementById('back-from-countdown').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        document.getElementById('back-from-settings').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        // Botón de configuración
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.populateSettingsForm();
        });
        
        // Botones de edición de título
        this.setupTitleEditors();
        
        // Configuración de temporizador
        this.setupTimerPresets();
        
        // Selector de hora objetivo
        this.setupTimePicker();
        
        // Configuración de la aplicación
        this.setupSettingsForm();
    }
    
    showScreen(screenId) {
        console.log('Cambiando a pantalla:', screenId); // Para debug
        
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla solicitada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Aplicar configuración actual
            this.settingsManager.applySettings();
        } else {
            console.error('Pantalla no encontrada:', screenId);
        }
    }
    
    // ... el resto del código permanece igual ...
    setupTitleEditors() {
        // Reloj actual
        document.getElementById('edit-clock-title').addEventListener('click', () => {
            this.toggleTitleEditor('clock');
        });
        
        document.getElementById('save-clock-title').addEventListener('click', () => {
            this.saveTitle('clock');
        });
        
        // Cronómetro
        document.getElementById('edit-stopwatch-title').addEventListener('click', () => {
            this.toggleTitleEditor('stopwatch');
        });
        
        document.getElementById('save-stopwatch-title').addEventListener('click', () => {
            this.saveTitle('stopwatch');
        });
        
        // Temporizador
        document.getElementById('edit-timer-title').addEventListener('click', () => {
            this.toggleTitleEditor('timer');
        });
        
        document.getElementById('save-timer-title').addEventListener('click', () => {
            this.saveTitle('timer');
        });
        
        // Temporizador hasta hora
        document.getElementById('edit-countdown-title').addEventListener('click', () => {
            this.toggleTitleEditor('countdown');
        });
        
        document.getElementById('save-countdown-title').addEventListener('click', () => {
            this.saveTitle('countdown');
        });
    }
    
    toggleTitleEditor(type) {
        const editor = document.getElementById(`${type}-title-edit`);
        const input = document.getElementById(`${type}-title-input`);
        const currentTitle = document.getElementById(`${type}-title`).textContent;
        
        if (editor.classList.contains('hidden')) {
            input.value = currentTitle;
            editor.classList.remove('hidden');
        } else {
            editor.classList.add('hidden');
        }
    }
    
    saveTitle(type) {
        const input = document.getElementById(`${type}-title-input`);
        const titleElement = document.getElementById(`${type}-title`);
        const editor = document.getElementById(`${type}-title-edit`);
        
        if (input.value.trim() !== '') {
            titleElement.textContent = input.value.trim();
        } else {
            titleElement.textContent = 'Chinese Test'; // Valor por defecto
        }
        
        editor.classList.add('hidden');
    }
    
    setupTimerPresets() {
        const presetSelect = document.getElementById('timer-presets');
        const customInput = document.getElementById('custom-timer-input');
        
        presetSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInput.classList.remove('hidden');
            } else {
                customInput.classList.add('hidden');
                // Actualizar el temporizador con el valor seleccionado
                if (window.timerManager) {
                    window.timerManager.setTimer(parseInt(e.target.value));
                }
            }
        });
        
        document.getElementById('set-custom-time').addEventListener('click', () => {
            const customTime = document.getElementById('custom-time').value;
            if (this.validateTimeFormat(customTime)) {
                if (window.timerManager) {
                    window.timerManager.setCustomTime(customTime);
                }
                customInput.classList.add('hidden');
                presetSelect.value = 'custom';
            } else {
                alert('Formato de tiempo inválido. Use HH:MM:SS');
            }
        });
    }
    
    validateTimeFormat(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }
    
    setupTimePicker() {
        const setTimeBtn = document.getElementById('set-target-time');
        const modal = document.getElementById('time-picker-modal');
        const cancelBtn = document.getElementById('cancel-time-picker');
        const saveBtn = document.getElementById('save-target-time');
        
        setTimeBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            
            // Establecer valor por defecto: hora actual + 50 minutos
            const now = new Date();
            now.setMinutes(now.getMinutes() + 50);
            const timeString = now.toTimeString().substring(0, 5);
            document.getElementById('target-time-input').value = timeString;
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        saveBtn.addEventListener('click', () => {
            const selectedTime = document.getElementById('target-time-input').value;
            if (selectedTime) {
                if (window.countdownManager) {
                    window.countdownManager.setTargetTime(selectedTime);
                }
                modal.classList.add('hidden');
            }
        });
    }
    
    setupSettingsForm() {
        const bgColorInput = document.getElementById('bg-color');
        const clockTextColorInput = document.getElementById('clock-text-color');
        const accentColorInput = document.getElementById('accent-color');
        const fontFamilySelect = document.getElementById('font-family');
        const resetBtn = document.getElementById('reset-settings');
        
        // Actualizar configuración cuando cambian los valores
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
        
        resetBtn.addEventListener('click', () => {
            this.settingsManager.resetToDefaults();
            this.populateSettingsForm();
        });
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
