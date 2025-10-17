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
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

class TimerManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.totalTime = 600; // 10 minutos por defecto
        this.remainingTime = this.totalTime;
        this.isRunning = false;
        this.intervalId = null;
        console.log('TimerManager inicializado');
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de timer');
        
        // Reset
        const resetBtn = document.getElementById('reset-timer');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset timer clickeado');
                this.reset();
            });
        }
        
        // Start
        const startBtn = document.getElementById('start-timer');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start timer clickeado');
                this.start();
                this.toggleButtons('timer', true);
            });
        }
        
        // Pause
        const pauseBtn = document.getElementById('pause-timer');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('Pause timer clickeado');
                this.pause();
                this.toggleButtons('timer', false);
            });
        }
        
        // Custom time
        const setCustomBtn = document.getElementById('set-custom-time');
        if (setCustomBtn) {
            setCustomBtn.addEventListener('click', () => {
                console.log('Set custom time clickeado');
                this.handleCustomTime();
            });
        }
        
        // Presets
        const presetSelect = document.getElementById('timer-presets');
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                console.log('Preset cambiado:', e.target.value);
                if (e.target.value !== 'custom') {
                    this.setTimer(parseInt(e.target.value));
                    this.toggleButtons('timer', false);
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
            } else {
                alert('Formato de tiempo inválido. Use HH:MM:SS');
            }
        }
    }
    
    validateTimeFormat(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
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
    
    setTimer(seconds) {
        this.pause();
        this.totalTime = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();
        this.toggleButtons('timer', false);
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
        this.toggleButtons('timer', false);
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
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

class CountdownManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.targetTime = this.getDefaultTargetTime();
        this.intervalId = null;
        this.isRunning = true;
        console.log('CountdownManager inicializado');
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners de countdown');
        
        // Start
        const startBtn = document.getElementById('start-countdown');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start countdown clickeado');
                this.start();
                this.toggleButtons('countdown', true);
            });
        }
        
        // Pause
        const pauseBtn = document.getElementById('pause-countdown');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('Pause countdown clickeado');
                this.pause();
                this.toggleButtons('countdown', false);
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
            this.isRunning = false;
            console.log('Countdown pausado');
        }
    }
    
    getDefaultTargetTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 50);
        return now;
    }
    
    setTargetTime(timeString) {
        const now = new Date();
        const [hours, minutes] = timeString.split(':');
        this.targetTime = new Date(now);
        this.targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (this.targetTime < now) {
            this.targetTime.setDate(this.targetTime.getDate() + 1);
        }
        
        this.uiManager.updateTargetTimeDisplay(timeString);
        this.updateDisplay();
        this.toggleButtons('countdown', true);
    }
    
    init() {
        this.intervalId = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }
    
    updateDisplay() {
        const now = new Date();
        const diffMs = this.targetTime - now;
        
        if (diffMs <= 0) {
            this.uiManager.updateClockDisplay('countdown', '00:00:00');
            this.startBlinking();
            this.playAlarmSound();
            return;
        }
        
        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.uiManager.updateClockDisplay('countdown', timeString);
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
