// js/app.js - Modificaciones en TimerManager y CountdownManager

class TimerManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.totalTime = 600; // 10 minutos por defecto
        this.remainingTime = this.totalTime;
        this.isRunning = false;
        this.intervalId = null;
        this.blinkIntervalId = null;
        this.isBlinking = false;
        this.initEventListeners();
        this.updateDisplay();
    }
    
    initEventListeners() {
        document.getElementById('reset-timer').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('pause-timer').addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
                document.getElementById('pause-timer').textContent = 'Start';
            } else {
                this.start();
                document.getElementById('pause-timer').textContent = 'Pause';
            }
        });
        
        // Configurar presets
        document.getElementById('timer-presets').addEventListener('change', (e) => {
            if (e.target.value !== 'custom') {
                this.setTimer(parseInt(e.target.value));
            }
        });
    }
    
    setTimer(seconds) {
        this.stopBlinking();
        this.pause();
        this.totalTime = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();
        document.getElementById('pause-timer').textContent = 'Start';
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
            this.stopBlinking();
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
            this.isRunning = true;
        }
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
        }
    }
    
    reset() {
        this.stopBlinking();
        this.pause();
        this.remainingTime = this.totalTime;
        this.updateDisplay();
        document.getElementById('pause-timer').textContent = 'Start';
    }
    
    tick() {
        this.remainingTime--;
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
            this.pause();
            this.remainingTime = 0;
            this.startBlinking();
            // Reproducir sonido de alarma si está disponible
            this.playAlarmSound();
        }
    }
    
    startBlinking() {
        if (this.isBlinking) return;
        
        this.isBlinking = true;
        const timerDisplay = document.getElementById('timer');
        
        timerDisplay.classList.add('blinking-alarm', 'alarm-active');
    }
    
    stopBlinking() {
        if (this.blinkIntervalId) {
            clearInterval(this.blinkIntervalId);
            this.blinkIntervalId = null;
        }
        this.isBlinking = false;
        
        const timerDisplay = document.getElementById('timer');
        timerDisplay.classList.remove('blinking-alarm', 'alarm-active');
        timerDisplay.style.color = '';
        timerDisplay.style.backgroundColor = '';
    }
    
    playAlarmSound() {
        // Intentar reproducir sonido de alarma
        try {
            // Crear un contexto de audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800; // Frecuencia en Hz
            gainNode.gain.value = 0.3; // Volumen
            
            oscillator.start();
            
            // Parar después de 1 segundo
            setTimeout(() => {
                oscillator.stop();
            }, 1000);
            
        } catch (error) {
            console.log('No se pudo reproducir el sonido de alarma:', error);
            // Fallback: usar el sistema de notificaciones del navegador
            if (Notification.permission === 'granted') {
                new Notification('⏰ Temporizador completado', {
                    body: '¡El tiempo ha terminado!',
                    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕰️</text></svg>'
                });
            }
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
        this.blinkIntervalId = null;
        this.isBlinking = false;
        this.init();
        this.updateDisplay();
    }
    
    init() {
        this.intervalId = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }
    
    getDefaultTargetTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 50);
        return now;
    }
    
    setTargetTime(timeString) {
        this.stopBlinking();
        const now = new Date();
        const [hours, minutes] = timeString.split(':');
        this.targetTime = new Date(now);
        this.targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Si la hora objetivo ya pasó hoy, establecerla para mañana
        if (this.targetTime < now) {
            this.targetTime.setDate(this.targetTime.getDate() + 1);
        }
        
        this.uiManager.updateTargetTimeDisplay(timeString);
        this.updateDisplay();
    }
    
    updateDisplay() {
        const now = new Date();
        const diffMs = this.targetTime - now;
        
        if (diffMs <= 0) {
            this.uiManager.updateClockDisplay('countdown', '00:00:00');
            if (!this.isBlinking) {
                this.startBlinking();
                this.playAlarmSound();
            }
            return;
        }
        
        // Si estaba parpadeando pero ahora hay tiempo restante, detener el parpadeo
        if (this.isBlinking && diffMs > 0) {
            this.stopBlinking();
        }
        
        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.uiManager.updateClockDisplay('countdown', timeString);
    }
    
    startBlinking() {
        if (this.isBlinking) return;
        
        this.isBlinking = true;
        const countdownDisplay = document.getElementById('countdown');
       
        countdownDisplay.classList.add('blinking-alarm', 'alarm-active');
    }
    
    stopBlinking() {
        if (this.blinkIntervalId) {
            clearInterval(this.blinkIntervalId);
            this.blinkIntervalId = null;
        }
        this.isBlinking = false;
        
        const countdownDisplay = document.getElementById('countdown');
        countdownDisplay.classList.remove('blinking-alarm', 'alarm-active');
        countdownDisplay.style.color = '';
        countdownDisplay.style.backgroundColor = '';
    }
    
    playAlarmSound() {
        // Intentar reproducir sonido de alarma
        try {
            // Crear un contexto de audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.value = 600; // Frecuencia en Hz
            gainNode.gain.value = 0.2; // Volumen
            
            oscillator.start();
            
            // Parar después de 1.5 segundos
            setTimeout(() => {
                oscillator.stop();
            }, 1500);
            
        } catch (error) {
            console.log('No se pudo reproducir el sonido de alarma:', error);
            // Fallback: usar el sistema de notificaciones del navegador
            if (Notification.permission === 'granted') {
                new Notification('⏰ Temporizador completado', {
                    body: '¡La hora objetivo ha llegado!',
                    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕰️</text></svg>'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('⏰ Temporizador completado', {
                            body: '¡La hora objetivo ha llegado!',
                            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕰️</text></svg>'
                        });
                    }
                });
            }
        }
    }
}
