// ui.js
// Clase para manejar sonidos
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
    }

    loadSound(name, url) {
        this.sounds[name] = new Audio(url);
        this.sounds[name].load();
    }

    play(name) {
        if (this.enabled && this.sounds[name]) {
            // Reiniciar si ya se está reproduciendo
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(e => {
                console.log('Error reproduciendo sonido:', e);
            });
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

class UI {
    constructor(settings, game, stats) {
        this.settings = settings;
        this.game = game;
        this.stats = stats;
        this.labels = LABELS;
        this.vocabLists = [];
        this.currentList = null;
        this.filteredLists = [];
        this.currentFilter = 'all';
        this.game2 = new Game2(settings, stats, this);
        this.game4 = new Game4(settings, stats, this);

        this.soundManager = new SoundManager();
        
        this.setupEventListeners();
        this.loadVocabLists().then(() => {
            this.updateLabels();
            this.loadSounds();
        });
    }
    
    setupEventListeners() {
        // Header clickeable para volver al menú
        const headerHome = document.getElementById('header-home');
        if (headerHome) {
            headerHome.addEventListener('click', () => this.goToHome());
        }
        
        // Botones del menú
        const vocabListsBtn = document.getElementById('vocab-lists-btn');
        const game1Btn = document.getElementById('game1-btn');
        const game2Btn = document.getElementById('game2-btn');
        const game3Btn = document.getElementById('game3-btn'); 
        const game4Btn = document.getElementById('game4-btn');
        const wordsBtn = document.getElementById('words-btn');
        const statsBtn = document.getElementById('stats-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (vocabListsBtn) vocabListsBtn.addEventListener('click', () => this.showScreen('lists-screen'));
        if (game1Btn) game1Btn.addEventListener('click', () => this.game.startGame('game1'));
        if (game2Btn) game2Btn.addEventListener('click', () => this.game.startGame('game2'));
        if (game3Btn) game3Btn.addEventListener('click', () => this.game2.startGame());
        if (game4Btn) game4Btn.addEventListener('click', () => this.game4.startGame());
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
        
        // Sliders y switch
        const questionsSlider = document.getElementById('questions-slider');
        const timeSlider = document.getElementById('time-slider');
        const livesSlider = document.getElementById('lives-slider');
        const difficultySwitch = document.getElementById('difficulty-switch');
        const pinyinSwitch = document.getElementById('pinyin-switch'); // Nuevo
        
        if (questionsSlider) {
            questionsSlider.addEventListener('input', (e) => {
                const questionsValue = document.getElementById('questions-value');
                if (questionsValue) questionsValue.textContent = e.target.value;
            });
        }
        
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                const timeValue = document.getElementById('time-value');
                if (timeValue) timeValue.textContent = `${e.target.value} s.`;
            });
        }
        
        if (livesSlider) {
            livesSlider.addEventListener('input', (e) => {
                const livesValue = document.getElementById('lives-value');
                if (livesValue) livesValue.textContent = e.target.value;
            });
        }
        
        if (difficultySwitch) {
            difficultySwitch.addEventListener('change', (e) => {
                this.settings.set('difficulty', e.target.checked ? 2 : 1);
                this.settings.updateDifficultyEmoji();
            });
        }
        
        if (pinyinSwitch) {
            pinyinSwitch.addEventListener('change', (e) => {
                this.settings.set('showPinyin', e.target.checked);
            });
        }

        const soundSwitch = document.getElementById('sound-switch');
        if (soundSwitch) {
            soundSwitch.checked = this.settings.get('soundEnabled');
            soundSwitch.addEventListener('change', (e) => {
                this.settings.set('soundEnabled', e.target.checked);
                if (this.soundManager) {
                    this.soundManager.enabled = e.target.checked;
                }
            });
        }
      
        const fontSelect = document.getElementById('font-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.settings.set('chineseFont', e.target.value);
                this.applyChineseFont(); // Aplicar la fuente inmediatamente
            });
        }       
                
    }
        
    goToHome() {
        // Detener TODOS los juegos si están en curso
        if (this.game.timer) {
            clearTimeout(this.game.timer);
            this.game.timer = null;
        }
        if (this.game2 && this.game2.timer) {
            clearTimeout(this.game2.timer);
            this.game2.timer = null;
        }
        if (this.game4 && this.game4.timer) {
            clearTimeout(this.game4.timer);
            this.game4.timer = null;
        }

        // Deshabilitar controles de teclado de todos los juegos
        if (this.game.disableKeyboardControls) {
            this.game.disableKeyboardControls();
        }
        if (this.game2 && this.game2.disableKeyboardControls) {
            this.game2.disableKeyboardControls();
        }
        if (this.game4 && this.game4.disableKeyboardControls) {
            this.game4.disableKeyboardControls();
        }
            
        // Ocultar estadísticas del juego
        this.hideGameStats();
        
        // Mostrar pantalla de menú
        this.showScreen('menu-screen');
        
        // Mostrar feedback visual
        //this.showToast('Volviendo al menú principal', 'info');
        
        //console.log('Navegación al menú principal');
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
        const wordsTitle = document.querySelector('#words-screen h2');
        
        if (!container || !countElement || !wordsTitle) {
            console.error('No se encontraron elementos para mostrar palabras');
            return;
        }
        
        container.innerHTML = '';
        
        // Actualizar contador
        countElement.textContent = `${this.game.vocabulary.length} palabras`;
        
        // Usar el listado actual si está disponible, sino buscar en los parámetros URL
        let listTitle = 'Lista de Palabras'; // Valor por defecto
        
        if (this.currentList) {
            // Usar el listado actualmente seleccionado
            listTitle = this.currentList.title;
        } else if (this.vocabLists.length > 0 && this.game.vocabulary.length > 0) {
            // Buscar en los parámetros URL como fallback
            const urlParams = new URLSearchParams(window.location.search);
            const voclistParam = urlParams.get('voclist');
            
            if (voclistParam) {
                const foundList = this.vocabLists.find(list => list.filename === voclistParam);
                if (foundList) {
                    listTitle = foundList.title;
                }
            } else {
                // Si no hay parámetro URL, usar el primer listado como referencia
                listTitle = this.vocabLists[0].title;
            }
        }
        
        // Actualizar el título con el nombre del listado
        wordsTitle.textContent = listTitle;
        
        // Obtener el idioma configurado
        const lang = this.settings.get('language');
        
        // Mostrar cada palabra
        this.game.vocabulary.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            
            // Determinar la traducción según el idioma configurado
            let translation;
            if (lang === 'es' && word.es) {
                translation = word.es;
            } else {
                translation = word.en;
            }
            
            wordElement.innerHTML = `
                <div class="word-chinese">
                    <div class="word-character">${word.ch || ''}</div>
                    <div class="word-pinyin">${word.pin || ''}</div>
                </div>
                <div class="word-translation">${translation}</div>
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
        const game3Text = document.querySelector('#game3-btn .menu-text');
        const game4Text = document.querySelector('#game4-btn .menu-text');
        const wordsText = document.querySelector('#words-btn .menu-text');  
        const statsText = document.querySelector('#stats-btn .menu-text');
        
        if (vocabListsText) vocabListsText.textContent = currentLabels.menu.vocabLists;
        if (game1Text) game1Text.textContent = currentLabels.menu.game1;
        if (game2Text) game2Text.textContent = currentLabels.menu.game2;
        if (game3Text) game3Text.textContent = currentLabels.menu.game3;
        if (game4Text) game4Text.textContent = currentLabels.menu.game4;
        if (wordsText) wordsText.textContent = currentLabels.menu.words;  
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
        this.applyChineseFont();
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
                        this.filteredLists = [...this.vocabLists]; // Inicialmente mostrar todos
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
        this.createFilterButtons();
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
        this.filteredLists = [...this.vocabLists];
    }
    
    createFilterButtons() {
        const container = document.getElementById('vocab-lists-container');
        if (!container) return;
        
        // Crear contenedor para los botones de filtro
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-buttons';
        filterContainer.style.marginBottom = '1rem';
        filterContainer.style.display = 'flex';
        filterContainer.style.flexWrap = 'wrap';
        filterContainer.style.gap = '0.5rem';
        filterContainer.style.justifyContent = 'center';
        
        // Obtener niveles únicos
        const levels = ['all', ...new Set(this.vocabLists.map(list => list.level))];
        
        // Crear botones para cada nivel
        levels.forEach(level => {
            const button = document.createElement('button');
            button.className = `filter-btn ${level === 'all' ? 'active' : ''}`;
            button.textContent = level === 'all' ? 'All' : level;
            button.dataset.level = level;
            
            // Estilos para los botones de filtro
            button.style.padding = '0.5rem 1rem';
            button.style.border = '2px solid var(--pastel-brown-dark)';
            button.style.borderRadius = '20px';
            button.style.backgroundColor = level === 'all' ? 'var(--pastel-brown-dark)' : 'var(--pastel-orange)';
            button.style.color = level === 'all' ? 'white' : '#5d4037';
            button.style.cursor = 'pointer';
            button.style.transition = 'var(--transition)';
            button.style.fontSize = '0.9rem';
            button.style.fontWeight = 'bold';
            
            button.addEventListener('click', () => this.filterLists(level, button));
            
            filterContainer.appendChild(button);
        });
        
        // Insertar los botones de filtro antes del contenido de listas
        container.innerHTML = '';
        container.appendChild(filterContainer);
        
        // Crear contenedor para las listas
        this.listsContent = document.createElement('div');
        this.listsContent.className = 'lists-content';
        this.listsContent.style.maxHeight = '350px';
        this.listsContent.style.overflowY = 'auto';
        container.appendChild(this.listsContent);
        
        this.displayFilteredLists();
    }
    
    filterLists(level, clickedButton) {
        // Actualizar filtro actual
        this.currentFilter = level;
        
        // Actualizar listas filtradas
        if (level === 'all') {
            this.filteredLists = [...this.vocabLists];
        } else {
            this.filteredLists = this.vocabLists.filter(list => list.level === level);
        }
        
        // Actualizar estado activo de los botones
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.level === level;
            btn.style.backgroundColor = isActive ? 'var(--pastel-brown-dark)' : 'var(--pastel-orange)';
            btn.style.color = isActive ? 'white' : '#5d4037';
        });
        
        this.displayFilteredLists();
    }
    
    displayFilteredLists() {
        if (!this.listsContent) return;
        
        this.listsContent.innerHTML = '';
        
        if (this.filteredLists.length === 0) {
            this.listsContent.innerHTML = '<p style="text-align: center; padding: 2rem; color: #5d4037;">No hay listados para este nivel</p>';
            return;
        }
        
        this.filteredLists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'vocab-list-btn';
            button.textContent = `${list.title} (${list.level})`;
            button.addEventListener('click', () => this.selectVocabList(list));
            this.listsContent.appendChild(button);
        });
        
        console.log('Listados filtrados mostrados:', this.filteredLists.length, 'para nivel:', this.currentFilter);
    }
    
    displayVocabLists() {
        // Este método ahora es manejado por displayFilteredLists
        console.log('Display de listados manejado por sistema de filtros');
    }
    
    async selectVocabList(list) {
        //console.log('Seleccionando listado:', list.filename);
        this.showToast(`Loading "${list.title}"...`, 'info');
        
        // Cargar el listado tanto en Game como en Game2
        const successGame1 = await this.game.loadVocabularyList(list.filename);
        const successGame2 = await this.game2.loadVocabularyList(list.filename);
        if (this.game4) {
            // Game4 se carga mediante su propio sistema de popups
            // Solo guardamos el listado actual para referencia
            this.currentList = list;
        }
        
        if (successGame1 && successGame2) {
            this.currentList = list;
            const totalWords = this.game.vocabulary.length;
            const wordsWithPinyin = this.game2.vocabulary.length;
            this.showToast(`List "${list.title}" loaded (${totalWords} words)`, 'success');
            this.showScreen('menu-screen');
        } else {
            this.showToast(`Error cargando el listado "${list.title}"`, 'error');
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
        const livesSlider = document.getElementById('lives-slider');
        const difficultySlider = document.getElementById('difficulty-slider');
        const fontSelect = document.getElementById('font-select');
        
        if (languageSelect) this.settings.set('language', languageSelect.value);
        if (questionsSlider) this.settings.set('questions', parseInt(questionsSlider.value));
        if (timeSlider) this.settings.set('time', parseInt(timeSlider.value));
        if (livesSlider) this.settings.set('lives', parseInt(livesSlider.value));
        if (difficultySlider) this.settings.set('difficulty', parseInt(difficultySlider.value));
        if (fontSelect) this.settings.set('chineseFont', fontSelect.value);

        if (this.soundManager) {
            this.soundManager.enabled = this.settings.get('soundEnabled');
        }
        
        this.updateLabels();
        //this.showToast('Setting guardada', 'success');
        this.showScreen('menu-screen');
    }
    
    resetSettings() {
        this.settings.reset();
        this.settings.updateUI();
        this.updateLabels();
        //this.showToast('Configuración restablecida', 'info');
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error('No se encontró el elemento toast');
            return;
        }
        
        toast.textContent = message;
        toast.className = 'toast';
        
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
        if (Math.random() > 0.3) {
            return; // No mostrar nada el 70% de las veces
        }
        this.soundManager.play('correct');
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].successMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'success');
    }
    
    showRandomFailMessage() {
         if (Math.random() > 0.3) {
            return; // No mostrar nada el 70% de las veces
        }
        this.soundManager.play('wrong');
        const lang = this.settings.get('language');
        const messages = Object.values(this.labels[lang].failMessages);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(randomMessage, 'error');
    }

    applyChineseFont() {
        const font = this.settings.get('chineseFont');
        const chineseElements = document.querySelectorAll('.chinese-character, .option-chinese, .word-character');
        
        // Aplicar a elementos de caracteres chinos
        chineseElements.forEach(element => {
            element.classList.remove('noto-serif', 'noto-sans', 'simsun', 'kaiti', 'heiti', 'fangsong');
            element.classList.add(font);
        });
        
        // Aplicar a la vista previa de fuente
        const fontPreview = document.getElementById('font-preview');
        if (fontPreview) {
            fontPreview.classList.remove('noto-serif', 'noto-sans', 'simsun', 'kaiti', 'heiti', 'fangsong');
            fontPreview.classList.add(font);
        }
    }

    // POPUP FINAL
    showGameResults(score, totalQuestions, missedWords, gameType, playAgainCallback) {
        const lang = this.settings.get('language');
        const labels = this.labels[lang].gameResults;
        
        // Crear popup
        const popup = document.createElement('div');
        popup.className = 'results-popup';
        
        // Determinar mensaje según puntuación
        let message;
        if (score === totalQuestions) {
            message = labels.perfectGame;
        } else if (score >= totalQuestions * 0.8) {
            message = labels.excellent;
        } else if (score >= totalQuestions * 0.6) {
            message = labels.goodJob;
        } else {
            message = labels.keepPracticing;
        }
        
        // Crear contenido
        /* <span class="word-chinese">${word.ch || ''}</span>
           <span class="word-translation">${lang === 'es' && word.es ? word.es : word.en}</span>*/
        popup.innerHTML = `
            <div class="results-content">
                <h2 class="results-title">${labels.title}</h2>
                <div class="results-message">${message}</div>
                
                <div class="results-stats">
                    <div class="results-score">
                        ${labels.score}: <strong>${score}/${totalQuestions}</strong>
                    </div>
                    ${missedWords.length > 0 ? `
                        <div class="results-missed">
                            <strong>${labels.missedWords}:</strong>
                            ${missedWords.map(word => `
                                <div class="missed-word">
                                    <span class="word-chinese">${word.ch || ''}</span>
                                    ${word.pin ? `<span class="word-pinyin">[${word.pin}]</span>` : ''}
                                    <span class="word-translation">${lang === 'es' && word.es ? word.es : word.en}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="results-buttons">
                    <button class="results-btn play-again">${labels.playAgain}</button>
                    <button class="results-btn back-menu">${labels.backToMenu}</button>
                </div>
            </div>
        `;
        
        // Event listeners
        popup.querySelector('.play-again').addEventListener('click', () => {
            document.body.removeChild(popup);
            playAgainCallback();
        });
        
        popup.querySelector('.back-menu').addEventListener('click', () => {
            document.body.removeChild(popup);
            this.goToHome();
        });
        
        // Cerrar al hacer click fuera
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
                this.goToHome();
            }
        });
        
        document.body.appendChild(popup);
    }

    showTimeUpMessage() {
        const lang = this.settings.get('language');
        const timeUpMessage = this.labels[lang].game.timeUp;
        this.showToast(timeUpMessage, 'error');
        
        // También reproducir sonido de error
        if (this.soundManager) {
            this.soundManager.play('wrong');
        }
    }

    loadSounds() {
        // URLs base - ajusta según tu estructura de carpetas
        const baseUrl = 'https://isaacjar.github.io/chineseapps/yulin/sound/';
        
        this.soundManager.loadSound('correct', baseUrl + 'correct.mp3');
        this.soundManager.loadSound('wrong', baseUrl + 'wrong.mp3');
        
        console.log('Sounds loaded');
    }
}
