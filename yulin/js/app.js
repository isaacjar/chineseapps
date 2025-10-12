// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar componentes
    const settings = new Settings();
    const stats = new Stats();
    const ui = new UI(settings, null); // Game se inicializará después
    
    const game = new Game(settings, stats, ui);
    ui.game = game; // Conectar UI con Game
    
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
