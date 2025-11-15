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
    
    // Verificar parámetros URL para voclist
    const urlParams = new URLSearchParams(window.location.search);
    const voclistParam = urlParams.get('voclist');
    
    if (voclistParam) {
        // Hay parámetro voclist en la URL, cargarlo
        console.log('Cargando listado desde URL parameter:', voclistParam);
        const success = await game.loadVocabularyList(voclistParam);
        
        if (success) {
            console.log('Listado cargado desde URL:', voclistParam);
            // Mostrar menú principal
            ui.showScreen('menu-screen');
            ui.showToast(`Listado cargado desde URL: ${voclistParam}`, 'success');
        } else {
            // Error cargando el listado desde URL, mostrar pantalla de listados
            console.error('Error cargando listado desde URL, mostrando selector');
            ui.showScreen('lists-screen');
            ui.showToast(`Error cargando listado desde URL: ${voclistParam}`, 'error');
        }
    } else {
        // No hay parámetro voclist en la URL, mostrar pantalla de listados inmediatamente
        //console.log('No hay listado especificado en URL, mostrando selector');
        ui.showScreen('lists-screen');
    }
    
    // Actualizar UI inicial
    ui.updateLabels();
    stats.updateUI();
    
    //console.log('Yulin app inicializada correctamente');
});
