// features.js - Funcionalidades adicionales

// Mostrar lista de países
function showCountriesList() {
    stopAllGames();
    
    if (!window.countriesData || window.countriesData.length === 0) {
        showToast('Error loading countries data');
        return;
    }
    
    const countriesGrid = document.getElementById('countriesGrid');
    countriesGrid.innerHTML = '';
    
    // Ordenar países alfabéticamente por nombre en chino
    const sortedCountries = [...window.countriesData].sort((a, b) => a.ch.localeCompare(b.ch));
    
    sortedCountries.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.innerHTML = `
            <div class="country-name">${country.ch}</div>
            <div class="country-pinyin">${country.pin}</div>
            <div class="country-translation">${settings.language === 'es' ? country.sp : country.en}</div>
        `;
        
        countryCard.addEventListener('click', () => {
            showCountryModal(country);
        });
        
        countriesGrid.appendChild(countryCard);
    });
    
    // Configurar búsqueda
    const searchInput = document.getElementById('countrySearch');
    searchInput.addEventListener('input', filterCountries);
    
    showScreen('countriesListScreen');
}

// Filtrar países en la lista
function filterCountries() {
    const searchTerm = document.getElementById('countrySearch').value.toLowerCase();
    const countryCards = document.querySelectorAll('.country-card');
    
    countryCards.forEach(card => {
        const countryName = card.querySelector('.country-name').textContent;
        const pinyin = card.querySelector('.country-pinyin').textContent.toLowerCase();
        const translation = card.querySelector('.country-translation').textContent.toLowerCase();
        
        const matches = countryName.includes(searchTerm) || 
                       pinyin.includes(searchTerm) || 
                       translation.includes(searchTerm);
        
        card.style.display = matches ? 'block' : 'none';
    });
}

// Mostrar modal con bandera y silueta
function showCountryModal(country) {
    const modal = document.getElementById('countryModal');
    const modalFlag = document.getElementById('modalFlag');
    const modalOutline = document.getElementById('modalOutline');
    const modalCountryName = document.getElementById('modalCountryName');
    const modalCountryPinyin = document.getElementById('modalCountryPinyin');
    const modalCountryTranslation = document.getElementById('modalCountryTranslation');
    
    // Cargar imágenes
    modalFlag.src = `flags/${country.fileflag}`;
    modalFlag.alt = country.ch;
    
    // Intentar cargar la silueta, si no existe mostrar la bandera
    modalOutline.src = `outline/${country.fileflag}`;
    modalOutline.onerror = function() {
        this.src = `flags/${country.fileflag}`;
        this.style.filter = 'grayscale(1) brightness(0)';
    };
    
    // Mostrar información
    modalCountryName.textContent = country.ch;
    modalCountryPinyin.textContent = country.pin;
    modalCountryTranslation.textContent = settings.language === 'es' ? country.sp : country.en;
    
    modal.classList.remove('hidden');
}

// Cerrar modal
function closeCountryModal() {
    document.getElementById('countryModal').classList.add('hidden');
}

// Mostrar mapa interactivo de China
function showChinaMap() {
    stopAllGames();
    
    if (!window.placesData || window.placesData.length === 0) {
        showToast('Error loading places data');
        return;
    }
    
    const overlay = document.getElementById('interactivePointsOverlay');
    overlay.innerHTML = '';
    
    // Crear puntos interactivos
    window.placesData.forEach(place => {
        const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        point.setAttribute("cx", place.x);
        point.setAttribute("cy", place.y);
        point.setAttribute("r", "8");
        point.setAttribute("fill", "#E74C3C");
        point.setAttribute("stroke", "#FFFFFF");
        point.setAttribute("stroke-width", "2");
        point.setAttribute("class", "interactive-point");
        point.setAttribute("data-place", JSON.stringify(place));
        
        point.addEventListener('click', function() {
            const placeData = JSON.parse(this.getAttribute('data-place'));
            showLocationInfo(placeData);
        });
        
        point.addEventListener('mouseenter', function() {
            this.setAttribute("r", "10");
            this.setAttribute("fill", "#3498db");
        });
        
        point.addEventListener('mouseleave', function() {
            this.setAttribute("r", "8");
            this.setAttribute("fill", "#E74C3C");
        });
        
        overlay.appendChild(point);
    });
    
    // Limpiar información de ubicación
    document.getElementById('locationInfo').innerHTML = '<p class="location-prompt">Haz clic en un punto del mapa para ver información</p>';
    
    showScreen('chinaMapScreen');
}

// Mostrar información de la ubicación
function showLocationInfo(place) {
    const locationInfo = document.getElementById('locationInfo');
    
    const name = settings.language === 'es' ? place.sp : place.en;
    
    locationInfo.innerHTML = `
        <div class="location-name">${place.ch}</div>
        <div class="location-pinyin">${place.pin}</div>
        <div class="location-translation">${name}</div>
        <div class="location-description">${place.description || 'Información no disponible'}</div>
    `;
}

// Inicializar funcionalidades (añadir al initUI en ui.js)
function initFeatures() {
    // Botones de las nuevas funcionalidades
    document.getElementById('btnCountriesList').addEventListener('click', showCountriesList);
    document.getElementById('btnChinaMap').addEventListener('click', showChinaMap);
    
    // Botones de volver
    document.getElementById('btnBackFromCountries').addEventListener('click', goToMenu);
    document.getElementById('btnBackFromMap').addEventListener('click', goToMenu);
    
    // Cerrar modal
    document.getElementById('modalClose').addEventListener('click', closeCountryModal);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('countryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCountryModal();
        }
    });
}
