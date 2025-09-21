// Configuración por defecto
let settings = {
    language: 'en',
    pinyin: true,
    questions: 15,
    timer: 10,
    lives: 3,
    difficulty: 1, // 1 = fácil (4 opciones), 2 = difícil (6 opciones)
    countryCount: 50 // Número de países con los que jugar
};

// Cargar configuración desde localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('chinexplora_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);        
    }
    updateDifficultyIcon();

    // Solo actualizar UI si estamos en la pantalla de configuración
    if (document.getElementById('settingsScreen') && !document.getElementById('settingsScreen').classList.contains('hidden')) {
        updateSettingsUI();
    }
}

// Actualizar UI de configuración (solo llamar cuando la pantalla esté visible)
function updateSettingsUI() {
   // Verificar si estamos en la pantalla de configuración
    const settingsScreen = document.getElementById('settingsScreen');
    if (!settingsScreen || settingsScreen.classList.contains('hidden')) {
        return;
    }

    // Actualizar el máximo del slider según los países disponibles
    const maxCountries = window.countriesData ? window.countriesData.length : 135;
    const countryCountSlider = document.getElementById('countryCountSlider');
    if (countryCountSlider) {
        countryCountSlider.max = maxCountries;
        countryCountSlider.value = Math.min(settings.countryCount, maxCountries);
        document.getElementById('countryCountValue').textContent = Math.min(settings.countryCount, maxCountries);
    }

    // Aplicar configuración a la UI solo si los elementos existen
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = settings.language;
    
    const pinyinToggle = document.getElementById('pinyinToggle');
    if (pinyinToggle) pinyinToggle.checked = settings.pinyin;
    
    const difficultyToggle = document.getElementById('difficultyToggle');
    if (difficultyToggle) difficultyToggle.checked = settings.difficulty === 2;
    
    updateDifficultyIcon();
    
    const questionsSlider = document.getElementById('questionsSlider');
    if (questionsSlider) {
        questionsSlider.value = settings.questions;
        document.getElementById('questionsValue').textContent = settings.questions;
    }
    
    const timerSlider = document.getElementById('timerSlider');
    if (timerSlider) {
        timerSlider.value = settings.timer;
        document.getElementById('timerValue').textContent = settings.timer + ' s';
    }
    
    const livesSlider = document.getElementById('livesSlider');
    if (livesSlider) {
        livesSlider.value = settings.lives;
        document.getElementById('livesValue').textContent = settings.lives;
    }
}

// Actualizar icono de dificultad
function updateDifficultyIcon() {
    const difficultyIcon = document.getElementById('difficultyIcon');
    if (difficultyIcon) {
        difficultyIcon.textContent = settings.difficulty === 2 ? '🥵' : '😎';
    }
}

// Guardar configuración
function saveSettings() {
    const languageSelect = document.getElementById('languageSelect');
    const pinyinToggle = document.getElementById('pinyinToggle');
    const difficultyToggle = document.getElementById('difficultyToggle');
    const questionsSlider = document.getElementById('questionsSlider');
    const timerSlider = document.getElementById('timerSlider');
    const livesSlider = document.getElementById('livesSlider');
    const countryCountSlider = document.getElementById('countryCountSlider');

    if (languageSelect) settings.language = languageSelect.value;
    if (pinyinToggle) settings.pinyin = pinyinToggle.checked;
    if (difficultyToggle) settings.difficulty = difficultyToggle.checked ? 2 : 1;
    if (questionsSlider) settings.questions = parseInt(questionsSlider.value);
    if (timerSlider) settings.timer = parseInt(timerSlider.value);
    if (livesSlider) settings.lives = parseInt(livesSlider.value);
    if (countryCountSlider) settings.countryCount = parseInt(countryCountSlider.value);
    
    localStorage.setItem('chinexplora_settings', JSON.stringify(settings));
    
    // Actualizar idioma
    loadLanguage(settings.language);
    
    showToast(getTranslation('settingsSaved'));
    goToMenu();
}

// Resetear configuración
function resetSettings() {
    settings = {
        language: 'en',
        pinyin: true,
        questions: 15,
        timer: 10,
        lives: 3,
        difficulty: 1,
        countryCount: 10
    };
    
    // Aplicar configuración por defecto a la UI
    updateSettingsUI();
    showToast(getTranslation('settingsReset'));
}

// Cancelar cambios de configuración
function cancelSettings() {
    // Recargar configuración actual
    loadSettings();
    goToMenu();
}
