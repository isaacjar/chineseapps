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
    
    // Aplicar configuración a la UI
    document.getElementById('languageSelect').value = settings.language;
    document.getElementById('pinyinToggle').checked = settings.pinyin;
    document.getElementById('difficultyToggle').checked = settings.difficulty === 2;
    updateDifficultyIcon();
    document.getElementById('questionsSlider').value = settings.questions;
    document.getElementById('questionsValue').textContent = settings.questions;
    document.getElementById('timerSlider').value = settings.timer;
    document.getElementById('timerValue').textContent = settings.timer + ' s';
    document.getElementById('livesSlider').value = settings.lives;
    document.getElementById('livesValue').textContent = settings.lives;
    document.getElementById('difficultySlider').value = settings.difficulty;
    document.getElementById('countryCountSlider').value = settings.countryCount;
    document.getElementById('countryCountValue').textContent = settings.countryCount;
}

/ Actualizar icono de dificultad
function updateDifficultyIcon() {
    const difficultyIcon = document.getElementById('difficultyIcon');
    difficultyIcon.textContent = settings.difficulty === 2 ? '🥵' : '😎';
}

// Guardar configuración
function saveSettings() {
    settings.language = document.getElementById('languageSelect').value;
    settings.pinyin = document.getElementById('pinyinToggle').checked;
    settings.difficulty = document.getElementById('difficultyToggle').checked ? 2 : 1;
    settings.questions = parseInt(document.getElementById('questionsSlider').value);
    settings.timer = parseInt(document.getElementById('timerSlider').value);
    settings.lives = parseInt(document.getElementById('livesSlider').value);
    settings.countryCount = parseInt(document.getElementById('countryCountSlider').value);
    
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
    document.getElementById('languageSelect').value = settings.language;
    document.getElementById('pinyinToggle').checked = settings.pinyin;
    document.getElementById('difficultyToggle').checked = settings.difficulty === 2;
    updateDifficultyIcon();
    document.getElementById('questionsSlider').value = settings.questions;
    document.getElementById('questionsValue').textContent = settings.questions;
    document.getElementById('timerSlider').value = settings.timer;
    document.getElementById('timerValue').textContent = settings.timer + ' s';
    document.getElementById('livesSlider').value = settings.lives;
    document.getElementById('livesValue').textContent = settings.lives;
    document.getElementById('countryCountSlider').value = settings.countryCount;
    document.getElementById('countryCountValue').textContent = settings.countryCount;
    
    showToast(getTranslation('settingsReset'));
}

// Cancelar cambios de configuración
function cancelSettings() {
    // Recargar configuración actual
    loadSettings();
    goToMenu();
}
