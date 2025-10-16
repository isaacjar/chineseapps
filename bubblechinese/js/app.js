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
    await loadDictionary();
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

// Función para buscar caracteres en línea
async function fetchCharacterData(character) {
    try {
        // Usar API simple y gratuita
        const response = await fetch(`https://ccdb.hemiola.com/characters/${encodeURIComponent(character)}?fields=kDefinition,kMandarin`);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const charData = data[0];
                return {
                    ch: character,
                    pin: charData.kMandarin || '?',
                    en: charData.kDefinition || 'Unknown',
                    es: 'Desconocido', // Solo inglés por simplicidad
                    lv: '0',
                    gr: '999'
                };
            }
        }
    } catch (error) {
        console.warn(`No se pudo obtener datos para "${character}"`);
    }
    
    // Datos por defecto si no se encuentra
    return {
        ch: character,
        pin: '?',
        en: 'Unknown',
        es: 'Desconocido',
        lv: '0',
        gr: '999'
    };
}

// Procesar texto para extraer caracteres
function processText(text) {
    // Filtrar solo caracteres chinos
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    
    // Eliminar duplicados
    const uniqueChars = [...new Set(chineseChars)];
    
    // Buscar información de cada carácter
    const newCharacters = [];
    for (const char of uniqueChars) {
        let charData = charactersData.find(c => c.ch === char);
        
        if (!charData) {
            // Si no está en el diccionario local, buscar en línea
            charData = await fetchCharacterData(char);
        }
        
        if (charData) {
            newCharacters.push(charData);
        }
    }
    
    return newCharacters;
}

// Añadir caracteres a la aplicación
async function addCharacters(newChars) {
    appState.characters = newChars;
    saveStateToStorage();
    renderBubbles();
}

// Renderizar burbujas
function renderBubbles() {
    const bubble = document.createElement('div');
    
    // Determinar si es un carácter desconocido
    const isUnknown = !charactersData.find(c => c.ch === char.ch);
    const unknownClass = isUnknown ? 'unknown-character' : '';
    
    bubble.className = `bubble ${sizeClass} ${appState.currentFont} ${unknownClass}`;
    
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

    // Hacer burbuja clickable
    bubble.addEventListener('click', () => {
        showStrokeAnimation(char.ch);
    });

    container.appendChild(bubble);
});

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

     // Botón para mezclar caracteres
    document.getElementById('shuffleBtn').addEventListener('click', shuffleCharacters);
    
    // Botón para cambiar fuente
    document.getElementById('fontToggleBtn').addEventListener('click', cycleFont);

    document.getElementById('groupSelectBtn').addEventListener('click', showGroupSelection);
        
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
        reader.onload = async function(e) {
        const text = e.target.result;
        const newChars = await processText(text);
        await addCharacters(newChars);
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

    document.getElementById('confirmGroupsBtn').addEventListener('click', addSelectedGroups);
    document.getElementById('cancelGroupsBtn').addEventListener('click', () => {
        document.getElementById('groupModal').style.display = 'none';
    });
    document.querySelector('.group-close').addEventListener('click', () => {
        document.getElementById('groupModal').style.display = 'none';
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

// Función para mezclar caracteres aleatoriamente
function shuffleCharacters() {
    // Crear una copia del array y mezclarlo usando el algoritmo Fisher-Yates
    const shuffled = [...appState.characters];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Actualizar el estado con los caracteres mezclados
    appState.characters = shuffled;
    saveStateToStorage();
    renderBubbles();
}

// Nueva función para mostrar animación de trazos
function showStrokeAnimation(character) {
    // Crear modal para animación
    const modal = document.createElement('div');
    modal.className = 'stroke-modal';
    modal.innerHTML = `
        <div class="stroke-modal-content">
            <span class="stroke-close">&times;</span>
            <h3>Animación de Trazos: ${character}</h3>
            <div id="stroke-animation-container"></div>
            <div class="stroke-controls">
                <button id="play-stroke">Reproducir</button>
                <button id="reset-stroke">Reiniciar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Inicializar Hanzi Writer
    const writer = HanziWriter.create('stroke-animation-container', character, {
        width: 200,
        height: 200,
        padding: 10,
        strokeAnimationSpeed: 2,
        delayBetweenStrokes: 400,
        showOutline: true,
        showCharacter: false
    });
    
    // Event listeners para controles
    document.getElementById('play-stroke').addEventListener('click', () => {
        writer.animateCharacter();
    });
    
    document.getElementById('reset-stroke').addEventListener('click', () => {
        writer.showCharacter(); // Reset to show static character
    });
    
    // Cerrar modal
    modal.querySelector('.stroke-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Reproducir automáticamente al abrir
    writer.animateCharacter();
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);


