class UI {
    constructor(settings, game, stats) {
        this.settings = settings;
        this.game = game;
        this.stats = stats;
        this.labels = LABELS;
        this.vocabLists = [];
        
        this.setupEventListeners();
        this.loadVocabLists().then(() => {
            this.updateLabels();
        });
    }
    
    setupEventListeners() {
        // Botones del menú
        const vocabListsBtn = document.getElementById('vocab-lists-btn');
        const game1Btn = document.getElementById('game1-btn');
        const game2Btn = document.getElementById('game2-btn');
        const wordsBtn = document.getElementById('words-btn');
        const statsBtn = document.getElementById('stats-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (vocabListsBtn) vocabListsBtn.addEventListener('click', () => this.showScreen('lists-screen'));
        if (game1Btn) game1Btn.addEventListener('click', () => this.game.startGame('game1'));
        if (game2Btn) game2Btn.addEventListener('click', () => this.game.startGame('game2'));
        if (wordsBtn) wordsBtn.addEventListener('click', () => this.showWordsList());
        if (statsBtn) statsBtn.addEventListener('click', () => {
            this.stats.updateUI();
            this.showScreen('stats-screen');
        });
        
        // Botón de configuración
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showScreen('settings-screen');
                setTimeout(() => {
                    this.settings.updateUI();
                }, 50);
            });
        }
        
        // Botones de cierre
        const closeListsBtn = document.getElementById('close-lists-btn');
        const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
        const closeStatsBtn = document.getElementById('close-stats-btn');
        const closeWordsBtn = document.getElementById('close-words-btn');
        
        if (closeListsBtn) closeListsBtn.addEventListener('click', () => this.showScreen('menu-screen'));
        if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', () => this.showScreen('menu-screen'));
        if (closeStatsBtn) closeStatsBtn.addEventListener('click', () => this.showScreen('menu-screen'));
        if (closeWordsBtn) closeWordsBtn.addEventListener('click', () => this.showScreen('menu-screen'));
        
        // Configuración
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        
        // Estadísticas
        const resetStatsBtn = document.getElementById('reset-stats-btn');
        if (resetStatsBtn) resetStatsBtn.addEventListener('click', () => this.stats.reset());
        
        // Sliders
        const questionsSlider = document.getElementById('questions-slider');
        const timeSlider = document.getElementById('time-slider');
        const difficultySlider = document.getElementById('difficulty-slider');
        
        if (questionsSlider) {
            questionsSlider.addEventListener('input', (e) => {
                const questionsValue = document.getElementById('questions-value');
                if (questionsValue) questionsValue.textContent = e.target.value;
            });
        }
        
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                const timeValue = document.getElementById('time-value');
                if (timeValue) timeValue.textContent = e.target.value;
            });
        }
        
        if (difficultySlider) {
            difficultySlider.addEventListener('input', (e) => {
                this.settings.updateDifficultyEmoji();
            });
        }
    }
    
    showWordsList() {
        // Verificar si hay vocabulario cargado
        if (!this.game.vocabulary || this.game.vocabulary.length === 0) {
            this.showToast('Primero selecciona un listado de vocabulario', 'error');
            this.showScreen('lists-screen');
            return;
        }
        
        this.displayWords();
        this.showScreen('words-screen');
    }
    
    displayWords() {
        const container = document.getElementById('words-container');
        const countElement = document.getElementById('words-count');
        
        if (!container || !countElement) {
            console.error('No se encontraron elementos para mostrar palabras');
            return;
        }
        
        container.innerHTML = '';
        
        // Actualizar contador
        countElement.textContent = `${this.game.vocabulary.length} palabras`;
        
        // Mostrar cada palabra
        this.game.vocabulary.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            
            wordElement.innerHTML = `
                <div class="word-chinese">
                    <div class="word-character">${word.ch || ''}</div>
                    <div class="word-pinyin">${word.pin || ''}</div>
                </div>
                <div class="word-translations">
                    <div class="word-english">${word.en || ''}</div>
                    <div class="word-spanish">${word.es || word.en || ''}</div>
                </div>
            `;
            
            container.appendChild(wordElement);
        });
        
        console.log('Palabras mostradas:', this.game.vocabulary.length);
    }
    
    updateLabels() {
        const lang = this.settings.get('language');
        const currentLabels = this.labels[lang];
        
        if (!currentLabels) {
            console.error('No se encontraron etiquetas para el idioma:', lang);
            return;
        }
        
        // Actualizar título de la app
        const appTitle = document.getElementById('app-title');
        if (appTitle) appTitle.textContent = currentLabels.appTitle;
        
        // Actualizar menú
        const vocabListsText = document.querySelector('#vocab-lists-btn .menu-text');
        const game1Text = document.querySelector('#game1-btn .menu-text');
        const game2Text = document.querySelector('#game2-btn .menu-text');
        const wordsText = document.querySelector('#words-btn .menu-text'); // Nueva
        const statsText = document.querySelector('#stats-btn .menu-text');
        
        if (vocabListsText) vocabListsText.textContent = currentLabels.menu.vocabLists;
        if (game1Text) game1Text.textContent = currentLabels.menu.game1;
        if (game2Text) game2Text.textContent = currentLabels.menu.game2;
        if (wordsText) wordsText.textContent = currentLabels.menu.words; // Nueva
        if (statsText) statsText.textContent = currentLabels.menu.stats;
        
        // Actualizar pantalla de palabras (nueva)
        const wordsTitle = document.querySelector('#words-screen h2');
        const closeWordsBtn = document.getElementById('close-words-btn');
        
        if (wordsTitle) wordsTitle.textContent = currentLabels.words.title;
        if (closeWordsBtn) closeWordsBtn.textContent = currentLabels.words.close;
        
        // Actualizar pantalla de listados
        const listsTitle = document.querySelector('#lists-screen h2');
        const closeListsBtn = document.getElementById('close-lists-btn');
        
        if (listsTitle) listsTitle.textContent = currentLabels.lists.title;
        if (closeListsBtn) closeListsBtn.textContent = currentLabels.lists.close;
        
        // Actualizar pantalla de configuración
        const settingsTitle = document.querySelector('#settings-screen h2');
        const languageLabel = document.querySelector('#settings-screen label[for="language-select"]');
        const questionsLabel = document.querySelector('#settings-screen label[for="questions-slider"]');
        const timeLabel = document.querySelector('#settings-screen label[for="time-slider"]');
        const livesLabel = document.querySelector('#settings-screen label[for="lives-select"]');
        const difficultyLabel = document.querySelector('#settings-screen label[for="difficulty-slider"]');
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
        
        if (settingsTitle) settingsTitle.textContent = currentLabels.settings.title;
        if (languageLabel) languageLabel.textContent = currentLabels.settings.language;
        if (questionsLabel) questionsLabel.textContent = currentLabels.settings.questions;
        if (timeLabel) timeLabel.textContent = currentLabels.settings.time;
        if (livesLabel) livesLabel.textContent = currentLabels.settings.lives;
        if (difficultyLabel) difficultyLabel.textContent = currentLabels.settings.difficulty;
        if (saveSettingsBtn) saveSettingsBtn.textContent = currentLabels.settings.save;
        if (resetSettingsBtn) resetSettingsBtn.textContent = currentLabels.settings.reset;
        if (cancelSettingsBtn) cancelSettingsBtn.textContent = currentLabels.settings.cancel;
        
        // Actualizar pantalla de estadísticas
        const statsTitle = document.querySelector('#stats-screen h2');
        const wordsShownLabel = document.querySelector('.stat-item:nth-child(1) .stat-label');
        const correctAnswersLabel = document.querySelector('.stat-item:nth-child(2) .stat-label');
        const accuracyLabel = document.querySelector('.stat-item:nth-child(3) .stat-label');
        const resetStatsBtn = document.getElementById('reset-stats-btn');
        const closeStatsBtn = document.getElementById('close-stats-btn');
        
        if (statsTitle) statsTitle.textContent = currentLabels.stats.title;
        if (wordsShownLabel) wordsShownLabel.textContent = currentLabels.stats.wordsShown;
        if (correctAnswersLabel) correctAnswersLabel.textContent = currentLabels.stats.correctAnswers;
        if (accuracyLabel) accuracyLabel.textContent = currentLabels.stats.accuracy;
        if (resetStatsBtn) resetStatsBtn.textContent = currentLabels.stats.reset;
        if (closeStatsBtn) closeStatsBtn.textContent = currentLabels.stats.close;
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
        this.showToast(`Cargando "${list.title}"...`, 'info');
        
        const success = await this.game.loadVocabularyList(list.filename);
        if (success) {
            this.settings.set('currentVocabList', list.filename);
            this.showToast(`Listado "${list.title}" cargado (${this.game.vocabulary.length} palabras)`, 'success');
            this.showScreen('menu-screen');
        } else {
            this.showToast(`Error cargando el listado "${list.title}"`, 'error');
            // Mantener en la pantalla de listados para que el usuario pueda elegir otro
        }
    }
    
    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        
        // Mostrar la pantalla solicitada
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        } else {
            console.error('No se encontró la pantalla:', screenId);
        }
    }
    
    showGameStats() {
        const settingsBtn = document.getElementById('settings-btn');
        const gameStats = document.getElementById('game-stats');
        
        if (settingsBtn) settingsBtn.classList.add('hidden');
        if (gameStats) gameStats.classList.remove('hidden');
    }
    
    hideGameStats() {
        const settingsBtn = document.getElementById('settings-btn');
        const gameStats = document.getElementById('game-stats');
        
        if (settingsBtn) settingsBtn.classList.remove('hidden');
        if (gameStats) gameStats.classList.add('hidden');
    }
    
    saveSettings() {
        // Verificar que los elementos existen antes de obtener sus valores
        const languageSelect = document.getElementById('language-select');
        const questionsSlider = document.getElementById('questions-slider');
        const timeSlider = document.getElementById('time-slider');
        const livesSelect = document.getElementById('lives-select');
        const difficultySlider = document.getElementById('difficulty-slider');
        
        if (languageSelect) this.settings.set('language', languageSelect.value);
        if (questionsSlider) this.settings.set('questions', parseInt(questionsSlider.value));
        if (timeSlider) this.settings.set('time', parseInt(timeSlider.value));
        if (livesSelect) this.settings.set('lives', parseInt(livesSelect.value));
        if (difficultySlider) this.settings.set('difficulty', parseInt(difficultySlider.value));
        
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
        if (!toast) {
            console.error('No se encontró el elemento toast');
            return;
        }
        
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
