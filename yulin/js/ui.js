class UI {
    constructor(settings, game, stats) {
        this.settings = settings;
        this.game = game;
        this.stats = stats;
        this.labels = LABELS;
        this.vocabLists = [];
        
        this.setupEventListeners();
        this.loadVocabLists().then(() => {
            // Una vez cargados los listados, actualizar la UI si es necesario
            this.updateLabels();
        });
    }
    
    async loadVocabLists() {
        try {
            // Intentar cargar desde el archivo index.js remoto
            const response = await fetch('https://isaacjar.github.io/chineseapps/voclists/index.js');
            if (response.ok) {
                const scriptContent = await response.text();
                
                // Extraer el array voclists del script usando una expresión regular más robusta
                const match = scriptContent.match(/const voclists\s*=\s*(\[.*?\]);/s);
                if (match && match[1]) {
                    try {
                        // Evaluar el array de forma segura
                        const voclists = eval(`(${match[1]})`);
                        this.vocabLists = voclists;
                        console.log('Listados cargados desde servidor:', this.vocabLists.length);
                    } catch (e) {
                        console.error('Error parseando listados:', e);
                        this.useFallbackLists();
                    }
                } else {
                    console.warn('No se pudo encontrar el array voclists, usando listados de ejemplo');
                    this.useFallbackLists();
                }
            } else {
                console.warn('No se pudo cargar index.js, usando listados de ejemplo');
                this.useFallbackLists();
            }
        } catch (error) {
            console.error('Error cargando listados de vocabulario:', error);
            this.useFallbackLists();
        }
        
        this.displayVocabLists();
    }
    
    useFallbackLists() {
        // Listados de ejemplo como fallback
        this.vocabLists = [
            { filename: "H1L1", title: "HSK 1 Lesson 1", level: "H1", misc: "MIT" },
            { filename: "H1L2", title: "HSK 1 Lesson 2", level: "H1", misc: "MIT" },
            { filename: "H1L3", title: "HSK 1 Lesson 3", level: "H1", misc: "MIT" },
            { filename: "H2L1", title: "HSK 2 Lesson 1", level: "H2", misc: "MIT" },
            { filename: "H2L2", title: "HSK 2 Lesson 2", level: "H2", misc: "MIT" },
            { filename: "H2L3", title: "HSK 2 Lesson 3", level: "H2", misc: "MIT" },
            { filename: "H3L1", title: "HSK 3 Lesson 1", level: "H3", misc: "MIT" }
        ];
    }
    
    displayVocabLists() {
        const container = document.getElementById('vocab-lists-container');
        if (!container) {
            console.error('No se encontró el contenedor de listados');
            return;
        }
        
        container.innerHTML = '';
        
        if (this.vocabLists.length === 0) {
            container.innerHTML = '<p>No hay listados disponibles</p>';
            return;
        }
        
        this.vocabLists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'vocab-list-btn';
            button.textContent = `${list.title} (${list.level})`;
            button.addEventListener('click', () => this.selectVocabList(list));
            container.appendChild(button);
        });
        
        console.log('Listados mostrados:', this.vocabLists.length);
    }
    
    async selectVocabList(list) {
        console.log('Seleccionando listado:', list.filename);
        const success = await this.game.loadVocabularyList(list.filename);
        if (success) {
            this.settings.set('currentVocabList', list.filename);
            this.showToast(`Listado "${list.title}" cargado correctamente`, 'success');
            this.showScreen('menu-screen');
        } else {
            this.showToast(`Error cargando el listado "${list.title}"`, 'error');
            // Mantener en la pantalla de listados para que el usuario pueda elegir otro
        }
    }

    // ... el resto de los métodos permanece igual ...
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
    
    async loadVocabLists() {
        try {
            // En lugar de cargar el archivo index.js, vamos a definir los listados manualmente
            // o usar una API si está disponible
            this.vocabLists = [
                { filename: "H1L1", title: "HSK 1 Lesson 1", level: "H1", misc: "MIT" },
                { filename: "H1L2", title: "HSK 1 Lesson 2", level: "H1", misc: "MIT" },
                { filename: "H1L3", title: "HSK 1 Lesson 3", level: "H1", misc: "MIT" },
                { filename: "H2L1", title: "HSK 2 Lesson 1", level: "H2", misc: "MIT" },
                { filename: "H2L2", title: "HSK 2 Lesson 2", level: "H2", misc: "MIT" }
            ];
            this.displayVocabLists();
        } catch (error) {
            console.error('Error cargando listados de vocabulario:', error);
            // Listados de ejemplo como fallback
            this.vocabLists = [
                { filename: "H1L1", title: "HSK 1 Lesson 1", level: "H1", misc: "MIT" },
                { filename: "H1L2", title: "HSK 1 Lesson 2", level: "H1", misc: "MIT" }
            ];
            this.displayVocabLists();
        }
    }
}
