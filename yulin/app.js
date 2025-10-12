// Aplicación principal Yǔlín
class YulinApp {
  constructor() {
    this.currentGame = localStorage.getItem('currentGame') || 'vocabulary';
    this.currentLanguage = localStorage.getItem('currentLanguage') || 'en';
    this.games = {
      'vocabulary': {
        name: 'Vocabulary Quiz',
        description: 'Test your vocabulary knowledge',
        icon: '📚'
      },
      // Más juegos se pueden añadir aquí
    };
    
    this.init();
  }
  
  init() {
    // Inicializar componentes
    this.initGameSelector();
    this.initLanguageSelector();
    
    // Cargar el juego actual
    this.loadGame(this.currentGame);
    
    // Cargar vocabulario si es necesario
    const voclist = this.getVoclistParam();
    const voctitle = this.getTitleParam();
    
    if (voclist) {
      vocabularyManager.loadList(voclist, voctitle);
    } else {
      vocabularyManager.loadIndexAndShowPopup();
    }
  }
  
  initGameSelector() {
    const gameSelectorBtn = document.getElementById('gameSelector');
    const gameModal = document.getElementById('gameModal');
    const closeBtn = document.querySelector('.close');
    const gameList = document.getElementById('gameList');
    
    // Poblar lista de juegos
    Object.keys(this.games).forEach(gameId => {
      const game = this.games[gameId];
      const gameItem = document.createElement('button');
      gameItem.className = `game-item ${gameId === this.currentGame ? 'active' : ''}`;
      gameItem.innerHTML = `${game.icon} ${game.name}`;
      gameItem.onclick = () => {
        this.selectGame(gameId);
        gameModal.style.display = 'none';
      };
      gameList.appendChild(gameItem);
    });
    
    // Mostrar/ocultar modal
    gameSelectorBtn.onclick = () => {
      gameModal.style.display = 'block';
    };
    
    closeBtn.onclick = () => {
      gameModal.style.display = 'none';
    };
    
    window.onclick = (event) => {
      if (event.target === gameModal) {
        gameModal.style.display = 'none';
      }
    };
  }
  
  initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Marcar idioma actual
    langButtons.forEach(btn => {
      if (btn.dataset.lang === this.currentLanguage) {
        btn.classList.add('active');
      }
      
      btn.onclick = () => {
        this.selectLanguage(btn.dataset.lang);
      };
    });
  }
  
  selectGame(gameId) {
    this.currentGame = gameId;
    localStorage.setItem('currentGame', gameId);
    this.loadGame(gameId);
    
    // Actualizar UI
    document.querySelectorAll('.game-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`.game-item[data-game="${gameId}"]`)?.classList.add('active');
  }
  
  selectLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('currentLanguage', lang);
    
    // Actualizar UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
    
    // Notificar a los componentes del cambio de idioma
    if (window.currentGameInstance) {
      window.currentGameInstance.onLanguageChange(lang);
    }
  }
  
  loadGame(gameId) {
    // Por ahora solo tenemos el juego de vocabulario
    if (gameId === 'vocabulary') {
      window.currentGameInstance = new VocabularyGame(this);
    }
    // Aquí se pueden cargar otros juegos
  }
  
  getVoclistParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get("voclist");
  }

  getTitleParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get("title");
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.yulinApp = new YulinApp();
});
