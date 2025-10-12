// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar componentes
    const settings = new Settings();
    const stats = new Stats();
    
    // Inicializar Game primero
    const game = new Game(settings, stats, null);
    
    // Inicializar UI después, pasando todas las dependencias
    const ui = new UI(settings, game, stats);
    
    // Conectar UI con Game
    game.ui = ui;
    
    // Cargar listado de vocabulario si está especificado
    if (settings.get('currentVocabList')) {
        await game.loadVocabularyList(settings.get('currentVocabList'));
    } else {
        // Si no hay listado cargado, mostrar pantalla de listados
        ui.showScreen('lists-screen');
    }
    
    // Actualizar UI inicial
    ui.updateLabels();
    stats.updateUI();
    
    console.log('Yulin app inicializada correctamente');
});
