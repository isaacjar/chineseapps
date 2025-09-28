// Función global para detener todos los juegos
window.stopAllGames = function() {
    // Detener juego 1 si está activo
    if (typeof stopGame1 !== 'undefined') {
        stopGame1();
    }
    
    // Detener juego 2 si está activo
    if (typeof stopGame2 !== 'undefined') {
        stopGame2();
    }
    
    // Detener juego 3 si está activo
    if (typeof stopGame3 !== 'undefined') {
        stopGame3();
    }
};

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
  try {
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
   //console.log('Countries loaded:', window.countriesData.length); // Para debug
    // Actualizar el máximo del slider de países
    if (document.getElementById('countryCountSlider')) {
        document.getElementById('countryCountSlider').max = window.countriesData.length;
    }
  
 } catch (error) {
        console.error('Error loading JSON files:', error);
        // Inicializar con datos de ejemplo si hay error
        window.countriesData = [
            { ch: "中国", pin: "Zhōngguó", en: "China", sp: "China", fileflag: "china.png" },
            { ch: "美国", pin: "Měiguó", en: "United States", sp: "Estados Unidos", fileflag: "usa.png" },
            { ch: "西班牙", pin: "Xībānyá", en: "Spain", sp: "España", fileflag: "spain.png" }
        ];
        window.langData = {en: {}, es: {}};
    }
}
