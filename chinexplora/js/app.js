// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar configuración
    loadSettings();
    
    // Cargar idioma
    loadLanguage(settings.language);
    
    // Configurar event listeners
    document.getElementById('logo').addEventListener('click', goToMenu);
    document.getElementById('btnSettings').addEventListener('click', showSettings);
    
    // Botones del menú
    document.getElementById('btnGame1').addEventListener('click', startGame1);
    document.getElementById('btnGame2').addEventListener('click', function() {
        showToast('Coming soon!');
    });
    document.getElementById('btnGame3').addEventListener('click', function() {
        showToast('Coming soon!');
    });
    document.getElementById('btnStats').addEventListener('click', showStats);
    
    // Botones de configuración
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
    document.getElementById('btnResetSettings').addEventListener('click', resetSettings);
    document.getElementById('btnCancelSettings').addEventListener('click', cancelSettings);
    
    // Botones de estadísticas
    document.getElementById('btnAcceptStats').addEventListener('click', goToMenu);
    
    // Botones de game over
    document.getElementById('btnPlayAgain').addEventListener('click', function() {
        startGame1();
    });
    document.getElementById('btnGoToMenu').addEventListener('click', goToMenu);
    
    // Sliders de configuración
    document.getElementById('questionsSlider').addEventListener('input', function() {
        document.getElementById('questionsValue').textContent = this.value;
    });
    
    document.getElementById('timerSlider').addEventListener('input', function() {
        document.getElementById('timerValue').textContent = this.value + ' s';
    });
    
    document.getElementById('livesSlider').addEventListener('input', function() {
        document.getElementById('livesValue').textContent = this.value;
    });
    
    document.getElementById('difficultyToggle').addEventListener('change', function() {
        document.getElementById('difficultyValue').textContent = 
            this.checked ? getTranslation('hard') : getTranslation('easy');
    });
    
    // Mostrar menú inicial
    showScreen('menuScreen');
});
