class UI {
    constructor(settings, game) {
        this.settings = settings;
        this.game = game;
        this.labels = {};
        this.vocabLists = [];
        
        this.loadLabels();
        this.setupEventListeners();
        this.loadVocabLists();
    }
    
    async loadLabels() {
        try {
            const response = await fetch('js/lang.json');
            this.labels = await response.json();
            this.updateLabels();
        } catch (error) {
            console.error('Error cargando etiquetas:', error);
        }
    }
    
    async loadVocabLists() {
        try {
            const response = await fetch('https://isaacjar.github.io/chineseapps/voclists/index.js');
            const scriptContent = await response.text();
            
            // Extraer el array voclists del script
            const match = scriptContent.match(/const voclists = (\[.*?\]);/s);
            if (match) {
                // Evaluar el array de forma segura
                const voclists = eval(match[1]);
                this.vocabLists = voclists;
                this.displayVocabLists();
            }
        } catch (error) {
            console.error('Error cargando listados de vocabulario:', error);
        }
    }
    
    updateLabels() {
        const lang = this.settings.get('language');
        const currentLabels = this.labels[lang];
        
        // Actualizar título de la app
        document.getElementById('app-title').textContent = currentLabels.appTitle;
        
        // Actualizar menú
        document.querySelector('#vocab-lists-btn .menu-text').textContent = currentLabels.menu.vocabLists;
        document.querySelector('#game1-btn .menu-text').textContent = currentLabels.menu.game1;
        document.querySelector('#game2-btn .menu-text').textContent = currentLabels.menu.game2;
        document.querySelector('#stats-btn .menu-text').textContent = currentLabels.menu.stats;
        
        // Actualizar pantalla de listados
        document.querySelector('#lists-screen h2').textContent = currentLabels.lists.title;
        document.getElementById('close-lists-btn').textContent = currentLabels.lists.close;
        
        // Actualizar pantalla de configuración
        document.querySelector('#settings-screen h2').textContent = currentLabels.settings.title;
        document.querySelector('#settings-screen label[for="language-select"]').textContent = currentLabels.settings.language;
        document.querySelector('#settings-screen label[for="questions-slider"]').textContent = currentLabels.settings.questions;
        document.querySelector('#settings-screen label[for="time-slider"]').textContent = currentLabels.settings.time;
        document.querySelector('#settings-screen label[for="lives-select"]').textContent = currentLabels.settings.lives;
        document.querySelector('#settings-screen label[for="difficulty-slider"]').textContent = currentLabels.settings.difficulty;
        document.getElementById('save-settings-btn').textContent = currentLabels.settings.save;
        document.getElementById('reset-settings-btn').textContent = currentLabels.settings.reset;
        document.getElementById('cancel-settings-btn').textContent = currentLabels.settings.cancel;
        
        // Actualizar pantalla de estadísticas
        document.querySelector('#stats-screen h2').textContent = currentLabels.stats.title;
        document.querySelector('.stat-item:nth-child(1) .stat-label').textContent = currentLabels.stats.wordsShown;
        document.querySelector('.stat-item:nth-child(2) .stat-label').textContent = currentLabels.stats.correctAnswers;
        document.querySelector('.stat-item:nth-child(3) .stat-label').textContent = currentLabels.stats.accuracy;
        document.getElementById('reset-stats-btn').textContent = currentLabels.stats.reset;
        document.getElementById('close-stats-btn').textContent = currentLabels.stats.close;
    }
    
    displayVocabLists() {
        const container = document.getElementById('vocab-lists-container');
        container.innerHTML = '';
        
        this.vocabLists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'vocab-list-btn';
            button.textContent = `${list.title} (${list.level})`;
            button.addEventListener('click', () => this.selectVocabList(list));
            container.appendChild(button);
        });
    }
    
    async selectVocabList(list) {
        const success = await this.game.loadVocabularyList(list.filename);
        if (success) {
            this.settings.set('currentVocabList', list.filename);
            this.showToast(`Listado "${list.title}" cargado`, 'success');
            this.showScreen('menu-screen');
        } else {
            this.showToast('Error cargando el listado', 'error');
        }
    }
    
    setupEventListeners() {
        // Botones del menú
        document.getElementById('vocab-lists-btn').addEventListener('click', () => this.showScreen('lists-screen'));
        document.getElementById('game1-btn').addEventListener('click', () => this.game.startGame('game1'));
        document.getElementById('game2-btn').addEventListener('click', () => this.game.startGame('game2'));
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.stats.updateUI();
            this.showScreen('stats-screen');
        });
        
        // Botón de configuración
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.settings.updateUI();
            this.showScreen('settings-screen');
        });
        
        // Botones de cierre
        document.getElementById('close-lists-btn').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('cancel-settings-btn').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('close-stats-btn').addEventListener('click', () => this.showScreen('menu-screen'));
        
        // Configuración
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings-btn').addEventListener('click', () => this.resetSettings());
        
        // Estadísticas
        document.getElementById('reset-stats-btn').addEventListener('click', () => this.stats.reset());
        
        // Sliders
        document.getElementById('questions-slider').addEventListener('input', (e) => {
            document.getElementById('questions-value').textContent = e.target.value;
        });
        
        document.getElementById('time-slider').addEventListener('input', (e) => {
            document.getElementById('time-value').textContent = e.target.value;
        });
        
        document.getElementById('difficulty-slider').addEventListener('input', (e) => {
            this.settings.updateDifficultyEmoji();
        });
    }
    
    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        
        // Mostrar la pantalla solicitada
        const screen = document.getElementById(screenId);
        screen.classList.remove('hidden');
        screen.classList.add('active');
    }
    
    showGameStats() {
        document.getElementById('settings-btn').classList.add('hidden');
        document.getElementById('game-stats').classList.remove('hidden');
    }
    
    hideGameStats() {
        document.getElementById('settings-btn').classList.remove('hidden');
        document.getElementById('game-stats').classList.add('hidden');
    }
    
    saveSettings() {
        this.settings.set('language', document.getElementById('language-select').value);
        this.settings.set('questions', parseInt(document.getElementById('questions-slider').value));
        this.settings.set('time', parseInt(document.getElementById('time-slider').value));
        this.settings.set('lives', parseInt(document.getElementById('lives-select').value));
        this.settings.set('difficulty', parseInt(document.getElementById('difficulty-slider').value));
        
        this.updateLabels();
        this.showToast('Configuración guardada', 'success');
        this.showScreen('menu-screen');
    }
    
    resetSettings() {
        this.settings.reset();
        this.settings.updateUI();
        this.updateLabels();
        this.showToast('Configuración restablecida', 'info');
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast';
        
        // Añadir clase de tipo
        if (type === 'error') {
            toast.style.backgroundColor = '#ef9a9a';
        } else if (type === 'success') {
            toast.style.backgroundColor = '#a5d6a7';
        } else {
            toast.style.backgroundColor = 'var(--pastel-orange)';
        }
        
        // Mostrar toast
        setTimeout(() => {
            toast.classList.remove('hidden');
        }, 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    showRandomSuccessMessage() {
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].successMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'success');
    }
    
    showRandomFailMessage() {
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].failMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'error');
    }
}
