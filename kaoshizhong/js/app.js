// js/app.js - Versión completamente corregida

class ClockManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.init();
    }
    
    init() {
        this.updateClock();
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    updateClock() {
        const now = new Date();
        const timeString = this.formatTime(now);
        this.uiManager.updateClockDisplay('current-clock', timeString);
    }
    
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}

class StopwatchManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.intervalId = null;
        console.log('StopwatchManager inicializado');
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de stopwatch');
        
        // Reset
        const resetBtn = document.getElementById('reset-stopwatch');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset stopwatch clickeado');
                this.reset();
            });
        }
        
        // Start
        const startBtn = document.getElementById('start-stopwatch');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start stopwatch clickeado');
                this.start();
                this.toggleButtons('stopwatch', true);
            });
        }
        
        // Pause
        const pauseBtn = document.getElementById('pause-stopwatch');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('Pause stopwatch clickeado');
                this.pause();
                this.toggleButtons('stopwatch', false);
            });
        }
    }
    
    toggleButtons(type, isRunning) {
        console.log(`Toggle buttons ${type}, running: ${isRunning}`);
        const startBtn = document.getElementById(`start-${type}`);
        const pauseBtn = document.getElementById(`pause-${type}`);
        
        if (startBtn && pauseBtn) {
            if (isRunning) {
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
            } else {
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
            }
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.intervalId = setInterval(() => {
                this.update();
            }, 10);
            this.isRunning = true;
            console.log('Cronómetro iniciado');
        }
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            console.log('Cronómetro pausado');
        }
    }
    
    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.uiManager.updateClockDisplay('stopwatch', '00:00:00');
        this.toggleButtons('stopwatch', false);
        console.log('Cronómetro reseteado');
    }
    
    update() {
        this.elapsedTime = Date.now() - this.startTime;
        this.uiManager.updateClockDisplay('stopwatch', this.formatTime(this.elapsedTime));
    }
    
    updateDisplay() {
        this.uiManager.updateClockDisplay('stopwatch', this.formatTime(this.elapsedTime));
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const settingsManager = window.settingsManager;
        const showHours = settingsManager ? settingsManager.getShowHours() : true;
        
        if (showHours || hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

}

class TimerManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.totalTime = 600;
        this.remainingTime = this.totalTime;
        this.isRunning = false;
        this.intervalId = null;
        console.log('TimerManager inicializado');
        this.updateDisplay();
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de timer');
        
        const resetBtn = document.getElementById('reset-timer');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const setCustomBtn = document.getElementById('set-custom-time');
        const presetSelect = document.getElementById('timer-presets');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset timer clickeado');
                this.reset();
            });
        }
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start timer clickeado');
                this.start();
                this.toggleButtons(true);
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('Pause timer clickeado');
                this.pause();
                this.toggleButtons(false);
            });
        }
        
        if (setCustomBtn) {
            setCustomBtn.addEventListener('click', () => {
                console.log('Set custom time clickeado');
                this.handleCustomTime();
            });
        }
        
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                console.log('Preset cambiado:', e.target.value);
                if (e.target.value !== 'custom') {
                    this.setTimer(parseInt(e.target.value));
                    this.toggleButtons(false); // No iniciar automáticamente
                } else {
                    const customInput = document.getElementById('custom-timer-input');
                    if (customInput) {
                        customInput.classList.remove('hidden');
                    }
                }
            });
        }
    }
    
    handleCustomTime() {
        const customTimeInput = document.getElementById('custom-time');
        if (customTimeInput) {
            const customTime = customTimeInput.value;
            if (this.validateTimeFormat(customTime)) {
                this.setCustomTime(customTime);
                const customInput = document.getElementById('custom-timer-input');
                if (customInput) {
                    customInput.classList.add('hidden');
                }
                this.toggleButtons(false); // No iniciar automáticamente
            } else {
                alert('Formato de tiempo inválido. Use HH:MM:SS');
            }
        }
    }
    
    validateTimeFormat(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }
    
    toggleButtons(isRunning) {
        console.log(`Toggle buttons timer, running: ${isRunning}`);
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        
        if (startBtn && pauseBtn) {
            if (isRunning) {
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
            } else {
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
            }
        }
    }
    
    setTimer(seconds) {
        this.pause();
        this.totalTime = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();
        this.toggleButtons(false); // No iniciar automáticamente
    }
    
    setCustomTime(timeString) {
        const parts = timeString.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        
        this.setTimer(hours * 3600 + minutes * 60 + seconds);
    }
    
    start() {
        if (!this.isRunning && this.remainingTime > 0) {
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
            this.isRunning = true;
            console.log('Temporizador iniciado');
        }
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            console.log('Temporizador pausado');
        }
    }
    
    reset() {
        this.pause();
        this.remainingTime = this.totalTime;
        this.updateDisplay();
        this.toggleButtons(false);
        console.log('Temporizador reseteado');
    }
    
    tick() {
        this.remainingTime--;
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
            this.pause();
            this.remainingTime = 0;
            this.startBlinking();
            this.playAlarmSound();
        }
    }
    
    startBlinking() {
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.classList.add('blinking-alarm', 'alarm-active');
        }
    }
    
    playAlarmSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 1000);
            
        } catch (error) {
            console.log('No se pudo reproducir el sonido de alarma');
        }
    }
    
    updateDisplay() {
        this.uiManager.updateClockDisplay('timer', this.formatTime(this.remainingTime));
    }
    
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const settingsManager = window.settingsManager;
        const showHours = settingsManager ? settingsManager.getShowHours() : true;
        
        let sign = '-';
        let displayTime = totalSeconds;
        
        if (totalSeconds <= 0) {
            sign = '+';
            displayTime = Math.abs(totalSeconds);
        }
        
        const displayHours = Math.floor(displayTime / 3600);
        const displayMinutes = Math.floor((displayTime % 3600) / 60);
        const displaySeconds = displayTime % 60;
        
        if (showHours || displayHours > 0) {
            return `${sign}${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
        } else {
            return `${sign}${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
        }
    }
}

class CountdownManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.targetTime = this.getDefaultTargetTime();
        this.intervalId = null;
        this.isRunning = false;
        this.pausedTime = null;
        this.remainingMs = 0;
        console.log('CountdownManager inicializado');
        this.updateDisplay();
        this.updateTargetTimeDisplay();
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de countdown');
        
        const startBtn = document.getElementById('start-countdown');
        const pauseBtn = document.getElementById('pause-countdown');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start countdown clickeado');
                this.start();
                this.toggleButtons(true);
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('Pause countdown clickeado');
                this.pause();
                this.toggleButtons(false);
            });
        }
    }
    
    toggleButtons(isRunning) {
        const startBtn = document.getElementById('start-countdown');
        const pauseBtn = document.getElementById('pause-countdown');
        
        if (startBtn && pauseBtn) {
            if (isRunning) {
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
            } else {
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
            }
        }
    }
    
    getDefaultTargetTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 50);
        return now;
    }
    
    formatTimeForDisplay(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    updateTargetTimeDisplay() {
        const timeString = this.formatTimeForDisplay(this.targetTime);
        this.uiManager.updateTargetTimeDisplay(timeString);
    }
    
    setTargetTime(timeString) {
        const now = new Date();
        const [hours, minutes] = timeString.split(':');
        this.targetTime = new Date(now);
        this.targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (this.targetTime < now) {
            this.targetTime.setDate(this.targetTime.getDate() + 1);
        }
        
        this.updateTargetTimeDisplay();
        this.updateDisplay(); // Actualizar display pero no iniciar
        
        // NO iniciar automáticamente, esperar a que el usuario pulse Start
        this.toggleButtons(false);
        
        console.log('Hora objetivo establecida:', this.targetTime);
    }
    
    start() {
        if (!this.isRunning) {
            if (this.pausedTime !== null && this.remainingMs > 0) {
                // Reanudar desde pausa
                this.targetTime = new Date(Date.now() + this.remainingMs);
                this.pausedTime = null;
                this.remainingMs = 0;
            }
            
            // Forzar primera actualización inmediata
            this.updateDisplay();
            
            this.intervalId = setInterval(() => {
                this.updateDisplay();
            }, 1000);
            
            this.isRunning = true;
            console.log('Countdown iniciado');
        }
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            
            // Guardar tiempo restante
            const now = new Date();
            this.remainingMs = this.targetTime - now;
            this.pausedTime = now;
            
            this.isRunning = false;
            console.log('Countdown pausado');
        }
    }
    
    updateDisplay() {
        const now = new Date();
        let diffMs;
        
        if (this.isRunning) {
            diffMs = this.targetTime - now;
        } else if (this.pausedTime !== null) {
            diffMs = this.remainingMs;
        } else {
            diffMs = this.targetTime - now;
        }
        
        let sign = '-';
        let displayTime = diffMs;
        
        if (diffMs <= 0) {
            sign = '+';
            displayTime = Math.abs(diffMs);
            
            if (this.isRunning) {
                this.startBlinking();
                this.playAlarmSound();
                this.pause();
            }
        }
        
        const diffSeconds = Math.floor(displayTime / 1000);
        const timeString = `${sign}${this.formatTime(diffSeconds)}`;
        this.uiManager.updateClockDisplay('countdown', timeString);
    }
    
    formatTime(diffSeconds) {
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        const settingsManager = window.settingsManager;
        const showHours = settingsManager ? settingsManager.getShowHours() : true;
        
        if (showHours || hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    startBlinking() {
        const countdownDisplay = document.getElementById('countdown');
        if (countdownDisplay) {
            countdownDisplay.classList.add('blinking-alarm', 'alarm-active');
        }
    }
    
    playAlarmSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.2;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 1500);
            
        } catch (error) {
            console.log('No se pudo reproducir el sonido de alarma');
        }
    }
}

// Inicialización corregida
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - Inicializando aplicación...');
    
    const settingsManager = new SettingsManager();
    const uiManager = new UIManager(settingsManager);
    
    // Inicializar managers
    window.clockManager = new ClockManager(uiManager);
    window.stopwatchManager = new StopwatchManager(uiManager);
    window.timerManager = new TimerManager(uiManager);
    window.countdownManager = new CountdownManager(uiManager);
    
    // Inicializar event listeners después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        console.log('Inicializando event listeners...');
        window.stopwatchManager.initEventListeners();
        window.timerManager.initEventListeners();
        window.countdownManager.initEventListeners();
        
        settingsManager.applySettings();
        console.log('Aplicación inicializada correctamente');
    }, 100);
});
