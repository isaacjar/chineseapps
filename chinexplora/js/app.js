// app.js - Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cargar archivos JSON primero
        await loadJSONFiles();
        
        // Cargar configuración
        loadSettings();
        
        // Cargar idioma
        loadLanguage(settings.language);
        
        // Inicializar la interfaz
        initUI();
        
        // Mostrar menú inicial
        showScreen('menuScreen');
    } catch (error) {
        console.error('Error loading application:', error);
        alert('Error loading application. Please check console for details.');
    }
});

// Función para cargar todos los archivos JSON
async function loadJSONFiles() {
    // Cargar lang.json
    const langResponse = await fetch('js/lang.json');
    if (!langResponse.ok) {
        throw new Error('Failed to load lang.json');
    }
    window.langData = await langResponse.json();
    
    // Cargar countries.json
    const countriesResponse = await fetch('js/countries.json');
    if (!countriesResponse.ok) {
        throw new Error('Failed to load countries.json');
    }
    window.countriesData = await countriesResponse.json();
}
