// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar configuración
    loadSettings();
    
    // Cargar idioma
    loadLanguage(settings.language);
    
    // Inicializar la interfaz
    initUI();
    
    // Mostrar menú inicial
    showScreen('menuScreen');
});
