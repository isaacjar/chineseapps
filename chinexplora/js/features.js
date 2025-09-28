// features.js - Funcionalidades adicionales

// Mostrar lista de países
// Mostrar lista de países
function showCountriesList() {
    stopAllGames();
    
    if (!window.countriesData || window.countriesData.length === 0) {
        showToast('Error loading countries data');
        return;
    }
    
    const countriesGrid = document.getElementById('countriesGrid');
    countriesGrid.innerHTML = '';
    
    // Ordenar países alfabéticamente por pinyin (sin tildes para mejor ordenación)
    const sortedCountries = [...window.countriesData].sort((a, b) => {
        // Quitar tildes y convertir a minúsculas para ordenación consistente
        const pinyinA = a.pin.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const pinyinB = b.pin.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return pinyinA.localeCompare(pinyinB);
    });
    
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
    
    // Configurar búsqueda - el placeholder ya se actualizó automáticamente
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
    modalFlag.onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="200" height="120" fill="%23f0f0f0"/><text x="100" y="60" text-anchor="middle" fill="%23999">Bandera no disponible</text></svg>';
    };
    
    // Intentar cargar la silueta, si no existe mostrar un placeholder
    modalOutline.src = `outline/${country.fileflag}`;
    modalOutline.onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="200" height="120" fill="%23f8f9f9"/><text x="100" y="60" text-anchor="middle" fill="%23999">Silueta no disponible</text></svg>';
        this.style.filter = 'none';
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
    
    // Limpiar información de ubicación - usar la traducción
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = '<p class="location-prompt" data-lang="clickOnPoint">Haz clic en un punto para ver información</p>';
    
    // Forzar la actualización del texto traducido
    loadLanguage(settings.language);
    
    showScreen('chinaMapScreen');
}

// Mostrar información de la ubicación
function showLocationInfo(place) {
    const locationInfo = document.getElementById('locationInfo');
    
    // Usar el campo correcto según el idioma
    const name = settings.language === 'es' ? place.sp : place.en;
    const description = settings.language === 'es' ? place.es : place.en;
    
    locationInfo.innerHTML = `
        <div class="location-header">
            <span class="location-name">${place.ch}</span>
            <span class="location-pinyin">${place.pin}</span>
            <span class="location-translation">${name}</span>
        </div>
        <div class="location-description">${description || 'Información no disponible'}</div>
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
