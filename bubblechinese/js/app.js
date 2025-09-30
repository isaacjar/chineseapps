// Estado de la aplicación
const appState = {
    characters: [],
    fontSize: 3, // rem
    showPinyin: true,
    showSpanish: true,
    showEnglish: true,
    currentFont: 'font-ma-shan-zheng', // Fuente por defecto
    selectedGroups: new Set() // Grupos seleccionados
};

// Lista de fuentes disponibles
const availableFonts = [
    { id: 'font-ma-shan-zheng', name: 'Ma Shan Zheng', class: 'font-ma-shan-zheng' },
    { id: 'font-liu-jian-mao-cao', name: 'Liu Jian Mao Cao', class: 'font-liu-jian-mao-cao' },
    { id: 'font-zcool', name: 'ZCOOL QingKe', class: 'font-zcool' },
    { id: 'font-noto-sans', name: 'Noto Sans', class: 'font-noto-sans' },
    { id: 'font-simhei', name: 'SimHei', class: 'font-simhei' }
];

// Variable global para almacenar los datos del diccionario
let charactersData = [];

// Inicialización de la aplicación
async function initApp() {
    await loictionary();
    loadStateFromStorage();
    renderBubbles();
    setupEventListeners();
    updateFontIndicator();
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
        
        // Convertir Array back to Set
        if (parsedState.selectedGroups) {
            appState.selectedGroups = new Set(parsedState.selectedGroups);
        }
        
        // Actualizar estado de los botones
        document.getElementById('togglePinyinBtn').classList.toggle('active', appState.showPinyin);
        document.getElementById('toggleSpanishBtn').classList.toggle('active', appState.showSpanish);
        document.getElementById('toggleEnglishBtn').classList.toggle('active', appState.showEnglish);
    }
}

// Guardar estado en localStorage
function saveStateToStorage() {
    const stateToSave = {
        ...appState,
        selectedGroups: [...appState.selectedGroups] // Convertir Set a Array para localStorage
    };
    localStorage.setItem('bubbleChineseState', JSON.stringify(stateToSave));
}

// Cambiar a la siguiente fuente
function cycleFont() {
    const currentIndex = availableFonts.findIndex(font => font.id === appState.currentFont);
    const nextIndex = (currentIndex + 1) % availableFonts.length;
    appState.currentFont = availableFonts[nextIndex].id;
    saveStateToStorage();
    renderBubbles();
    updateFontIndicator();
}

// Actualizar el indicador visual de la fuente actual
function updateFontIndicator() {
    const fontBtn = document.getElementById('fontToggleBtn');
    const currentFontIndex = availableFonts.findIndex(font => font.id === appState.currentFont);
    const nextFontIndex = (currentFontIndex + 1) % availableFonts.length;
    const nextFont = availableFonts[nextFontIndex];
    
    // Actualizar tooltip
    fontBtn.title = `Cambiar fuente (Próxima: ${nextFont.name})`;
    
    // Asegurarse de que existe el indicador
    let indicator = fontBtn.querySelector('.font-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'font-indicator';
        fontBtn.appendChild(indicator);
    }
    
    // Cambiar color del indicador según la fuente
    const colors = ['#ff69b4', '#ff8c00', '#32cd32', '#1e90ff', '#8a2be2'];
    indicator.style.backgroundColor = colors[currentFontIndex] || '#ff69b4';
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
    // SUSTITUIR los caracteres en lugar de añadirlos
    appState.characters = newChars;
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
    
    // Determinar clase de tamaño
    let sizeClass = 'bubble-size-medium';
    if (appState.fontSize <= 2) sizeClass = 'bubble-size-small';
    else if (appState.fontSize <= 3.5) sizeClass = 'bubble-size-medium';
    else if (appState.fontSize <= 4.5) sizeClass = 'bubble-size-large';
    else sizeClass = 'bubble-size-xlarge';
    
    // Crear burbujas para cada carácter
    appState.characters.forEach(char => {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${sizeClass} ${appState.currentFont}`;
        
        let content = `<div class="character">${char.ch}</div>`;
        
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
    
    // Botón para cambiar fuente
    document.getElementById('fontToggleBtn').addEventListener('click', cycleFont);

    document.getElementById('groupSelectBtn').addEventListener('click', showGroupSelection);
    document.getElementById('confirmGroupsBtn').addEventListener('click', addSelectedGroups);
    document.getElementById('cancelGroupsBtn').addEventListener('click', () => {
        document.getElementById('groupModal').style.display = 'none';
    });
    document.querySelector('.group-close').addEventListener('click', () => {
        document.getElementById('groupModal').style.display = 'none';
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
        // SUSTITUIR los caracteres
        addCharacters(newChars);
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

// Nueva función para mostrar grupos
function showGroupSelection() {
    const modal = document.getElementById('groupModal');
    const container = document.getElementById('groupsContainer');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Obtener grupos únicos del diccionario
    const groups = [...new Set(charactersData.map(char => char.gr))].sort();
    
    // Crear botones para cada grupo
    groups.forEach(group => {
        const groupChars = charactersData.filter(char => char.gr === group);
        const groupBtn = document.createElement('button');
        groupBtn.className = `group-btn ${appState.selectedGroups.has(group) ? 'selected' : ''}`;
        groupBtn.innerHTML = `
            <div class="group-check"></div>
            <div class="group-name">Grupo ${group}</div>
            <div class="group-chars">${groupChars.map(char => char.ch).join(' ')}</div>
        `;
        
        groupBtn.addEventListener('click', () => {
            groupBtn.classList.toggle('selected');
        });
        
        container.appendChild(groupBtn);
    });
    
    modal.style.display = 'block';
}

// Nueva función para añadir grupos seleccionados
function addSelectedGroups() {
    const selectedGroupBtns = document.querySelectorAll('.group-btn.selected');
    const newGroups = new Set();
    
    selectedGroupBtns.forEach(btn => {
        const groupName = btn.querySelector('.group-name').textContent.replace('Grupo ', '');
        newGroups.add(groupName);
    });
    
    // Actualizar grupos seleccionados
    appState.selectedGroups = newGroups;
    
    // Obtener caracteres de los grupos seleccionados (SUSTITUIR, no añadir)
    const newCharacters = charactersData.filter(char => 
        appState.selectedGroups.has(char.gr)
    );
    
    // SUSTITUIR los caracteres en pantalla
    appState.characters = newCharacters;
    saveStateToStorage();
    renderBubbles();
    
    // Cerrar modal
    document.getElementById('groupModal').style.display = 'none';
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
