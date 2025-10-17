// js/ui.js - Versión corregida
class UIManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.currentScreen = 'menu-screen';
        this.initEventListeners();
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de UI');
        
        // Navegación del menú principal
        document.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const targetScreen = e.currentTarget.getAttribute('data-screen');
                console.log('Menú clickeado:', targetScreen);
                this.showScreen(targetScreen);
                
                // Re-inicializar event listeners específicos de cada pantalla
                setTimeout(() => {
                    if (targetScreen === 'stopwatch-screen' && window.stopwatchManager) {
                        window.stopwatchManager.initEventListeners();
                    } else if (targetScreen === 'timer-screen' && window.timerManager) {
                        window.timerManager.initEventListeners();
                    } else if (targetScreen === 'countdown-screen' && window.countdownManager) {
                        window.countdownManager.initEventListeners();
                    }
                }, 50);
            });
        });
        
        // Botones de retroceso
        this.setupBackButtons();
        
        // Botón de configuración
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.populateSettingsForm();
        });
        
        // Botones de edición de título
        this.setupTitleEditors();
        
        // Selector de hora objetivo
        this.setupTimePicker();
        
        // Configuración de la aplicación
        this.setupSettingsForm();
    }
    
    setupBackButtons() {
        const backButtons = [
            'back-from-clock',
            'back-from-stopwatch', 
            'back-from-timer',
            'back-from-countdown',
            'back-from-settings'
        ];
        
        backButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    console.log('Volver al menú desde:', btnId);
                    this.showScreen('menu-screen');
                });
            }
        });
    }
    
    showScreen(screenId) {
        console.log('Cambiando a pantalla:', screenId);
        
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
    
    setupTitleEditors() {
        // Configurar editores de título para cada pantalla
        const titleEditors = [
            { type: 'clock', editBtn: 'edit-clock-title', saveBtn: 'save-clock-title', input: 'clock-title-input' },
            { type: 'stopwatch', editBtn: 'edit-stopwatch-title', saveBtn: 'save-stopwatch-title', input: 'stopwatch-title-input' },
            { type: 'timer', editBtn: 'edit-timer-title', saveBtn: 'save-timer-title', input: 'timer-title-input' },
            { type: 'countdown', editBtn: 'edit-countdown-title', saveBtn: 'save-countdown-title', input: 'countdown-title-input' }
        ];
        
        titleEditors.forEach(editor => {
            const editBtn = document.getElementById(editor.editBtn);
            const saveBtn = document.getElementById(editor.saveBtn);
            
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.toggleTitleEditor(editor.type);
                });
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveTitle(editor.type);
                });
            }
        });
    }
    
    toggleTitleEditor(type) {
        const editor = document.getElementById(`${type}-title-edit`);
        const input = document.getElementById(`${type}-title-input`);
        const currentTitle = document.getElementById(`${type}-title`).textContent;
        
        if (editor && input) {
            if (editor.classList.contains('hidden')) {
                input.value = currentTitle;
                editor.classList.remove('hidden');
            } else {
                editor.classList.add('hidden');
            }
        }
    }
    
    saveTitle(type) {
        const input = document.getElementById(`${type}-title-input`);
        const titleElement = document.getElementById(`${type}-title`);
        const editor = document.getElementById(`${type}-title-edit`);
        
        if (input && titleElement && editor) {
            if (input.value.trim() !== '') {
                titleElement.textContent = input.value.trim();
            } else {
                titleElement.textContent = 'Chinese Test';
            }
            editor.classList.add('hidden');
        }
    }
    
    setupTimePicker() {
        const setTimeBtn = document.getElementById('set-target-time');
        const modal = document.getElementById('time-picker-modal');
        const cancelBtn = document.getElementById('cancel-time-picker');
        const saveBtn = document.getElementById('save-target-time');
        
        if (setTimeBtn && modal) {
            setTimeBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
                
                // Establecer valor por defecto: hora actual + 50 minutos
                const now = new Date();
                now.setMinutes(now.getMinutes() + 50);
                const timeString = now.toTimeString().substring(0, 5);
                const timeInput = document.getElementById('target-time-input');
                if (timeInput) {
                    timeInput.value = timeString;
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const timeInput = document.getElementById('target-time-input');
                if (timeInput && timeInput.value) {
                    if (window.countdownManager) {
                        window.countdownManager.setTargetTime(timeInput.value);
                    }
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                }
            });
        }
    }
    
    setupSettingsForm() {
        const saveBtn = document.getElementById('save-settings');
        const resetBtn = document.getElementById('reset-settings');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const formSettings = this.settingsManager.getFormSettings();
                Object.entries(formSettings).forEach(([key, value]) => {
                    this.settingsManager.updateSetting(key, value);
                });
                this.settingsManager.saveCurrentSettings();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres restablecer todos los valores a los predeterminados?')) {
                    this.settingsManager.resetToDefaults();
                    this.populateSettingsForm();
                }
            });
        }
    }
    
    populateSettingsForm() {
        const settings = this.settingsManager.getSettings();
        
        const bgColorInput = document.getElementById('bg-color');
        const clockTextColorInput = document.getElementById('clock-text-color');
        const accentColorInput = document.getElementById('accent-color');
        const fontFamilySelect = document.getElementById('font-family');
        
        if (bgColorInput) bgColorInput.value = settings.bgColor;
        if (clockTextColorInput) clockTextColorInput.value = settings.clockTextColor;
        if (accentColorInput) accentColorInput.value = settings.accentColor;
        if (fontFamilySelect) fontFamilySelect.value = settings.fontFamily;
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
