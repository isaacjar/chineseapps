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
    
    // Verificar si hay un listado cargado o parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const voclistParam = urlParams.get('voclist');
    
    if (settings.get('currentVocabList') || voclistParam) {
        // Hay un listado guardado o en parámetros URL, cargarlo
        const listToLoad = voclistParam || settings.get('currentVocabList');
        const success = await game.loadVocabularyList(listToLoad);
        
        if (success) {
            console.log('Listado cargado:', listToLoad);
            // Mostrar menú principal
            ui.showScreen('menu-screen');
        } else {
            // Error cargando el listado, mostrar pantalla de listados
            console.error('Error cargando listado, mostrando selector');
            ui.showScreen('lists-screen');
        }
    } else {
        // No hay listado cargado, mostrar pantalla de listados inmediatamente
        console.log('No hay listado cargado, mostrando selector');
        ui.showScreen('lists-screen');
    }
    
    // Actualizar UI inicial
    ui.updateLabels();
    stats.updateUI();
    
    console.log('Yulin app inicializada correctamente');
});
