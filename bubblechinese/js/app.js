// Estado de la aplicación
const appState = {
    characters: [],
    fontSize: 3, // rem
    showPinyin: true,
    showSpanish: true,
    showEnglish: true
};

// Variable global para almacenar los datos del diccionario
let charactersData = [];

// Inicialización de la aplicación
async function initApp() {
    await loadDictionary();
    loadStateFromStorage();
    renderBubbles();
    setupEventListeners();
}

// Cargar diccionario desde el archivo JSON
async function loadDictionary() {
    try {
        const response = await fetch('js/chars.json');
        if (!response.ok) {
            throw new Error(`Error cargando el diccionario: ${response.status}`);
        }
        charactersData = await response.json();
        console.log(`Diccionario cargado: ${charactersData.length} caracteres`);
    } catch (error) {
        console.error('Error al cargar el diccionario:', error);
        // En caso de error, usar datos de respaldo mínimos
        charactersData = [
            { ch: '你', pin: 'nǐ', en: 'you', es: 'tú', lv: '1', gr: '001' },
            { ch: '好', pin: 'hǎo', en: 'good', es: 'bueno', lv: '1', gr: '001' },
            { ch: '我', pin: 'wǒ', en: 'I/me', es: 'yo/mí', lv: '1', gr: '001' }
        ];
    }
}

// Cargar estado desde localStorage
function loadStateFromStorage() {
    const savedState = localStorage.getItem('bubbleChineseState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(appState, parsedState);
        
        // Actualizar estado de los botones
        document.getElementById('togglePinyinBtn').classList.toggle('active', appState.showPinyin);
        document.getElementById('toggleSpanishBtn').classList.toggle('active', appState.showSpanish);
        document.getElementById('toggleEnglishBtn').classList.toggle('active', appState.showEnglish);
    }
}

// Guardar estado en localStorage
function saveStateToStorage() {
    localStorage.setItem('bubbleChineseState', JSON.stringify(appState));
}

// Procesar texto para extraer caracteres
function processText(text) {
    // Filtrar solo caracteres chinos
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    
    // Eliminar duplicados
    const uniqueChars = [...new Set(chineseChars)];
    
    // Buscar información de cada carácter
    const newCharacters = [];
    uniqueChars.forEach(char => {
        const charData = charactersData.find(c => c.ch === char);
        if (charData) {
            newCharacters.push(charData);
        } else {
            // Si no está en el diccionario, crear un objeto básico
            newCharacters.push({
                ch: char,
                pin: '?',
                en: 'Unknown',
                es: 'Desconocido',
                lv: '0',
                gr: '000'
            });
        }
    });
    
    return newCharacters;
}

// Añadir caracteres a la aplicación
function addCharacters(newChars) {
    // Evitar duplicados
    const existingChars = appState.characters.map(c => c.ch);
    const filteredChars = newChars.filter(char => !existingChars.includes(char.ch));
    
    appState.characters = [...appState.characters, ...filteredChars];
    saveStateToStorage();
    renderBubbles();
}

// Renderizar burbujas
function renderBubbles() {
    const container = document.getElementById('bubblesContainer');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (appState.characters.length === 0) {
        // Mostrar mensaje de bienvenida
        container.innerHTML = `
            <div class="welcome-message">
                <h1>Bubble Chinese 🎈</h1>
                <p>Usa los botones de la izquierda para añadir caracteres chinos</p>
            </div>
        `;
        return;
    }
    
    // Crear burbujas para cada carácter
    appState.characters.forEach(char => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        let content = `<div class="character" style="font-size: ${appState.fontSize}rem">${char.ch}</div>`;
        
        if (appState.showPinyin && char.pin) {
            content += `<div class="pinyin">${char.pin}</div>`;
        }
        
        const meanings = [];
        if (appState.showSpanish && char.es) {
            meanings.push(char.es);
        }
        if (appState.showEnglish && char.en) {
            meanings.push(char.en);
        }
        
        if (meanings.length > 0) {
            content += `<div class="meaning">${meanings.join(' / ')}</div>`;
        }
        
        bubble.innerHTML = content;
        container.appendChild(bubble);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Botón para añadir texto
    document.getElementById('addTextBtn').addEventListener('click', () => {
        document.getElementById('textModal').style.display = 'block';
        document.getElementById('textInput').focus();
    });
    
    // Botón para cargar archivo
    document.getElementById('loadFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    // Manejar carga de archivo
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // Botones de tamaño
    document.getElementById('increaseSizeBtn').addEventListener('click', () => {
        appState.fontSize = Math.min(appState.fontSize + 0.5, 6);
        saveStateToStorage();
        renderBubbles();
    });
    
    document.getElementById('decreaseSizeBtn').addEventListener('click', () => {
        appState.fontSize = Math.max(appState.fontSize - 0.5, 1);
        saveStateToStorage();
        renderBubbles();
    });
    
    // Botones de toggle
    document.getElementById('togglePinyinBtn').addEventListener('click', () => {
        appState.showPinyin = !appState.showPinyin;
        document.getElementById('togglePinyinBtn').classList.toggle('active', appState.showPinyin);
        saveStateToStorage();
        renderBubbles();
    });
    
    document.getElementById('toggleSpanishBtn').addEventListener('click', () => {
        appState.showSpanish = !appState.showSpanish;
        document.getElementById('toggleSpanishBtn').classList.toggle('active', appState.showSpanish);
        saveStateToStorage();
        renderBubbles();
    });
    
    document.getElementById('toggleEnglishBtn').addEventListener('click', () => {
        appState.showEnglish = !appState.showEnglish;
        document.getElementById('toggleEnglishBtn').classList.toggle('active', appState.showEnglish);
        saveStateToStorage();
        renderBubbles();
    });
}

// Manejar carga de archivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const newChars = processText(text);
        addCharacters(newChars);
    };
    reader.readAsText(file);
    
    // Resetear el input para permitir cargar el mismo archivo otra vez
    event.target.value = '';
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
