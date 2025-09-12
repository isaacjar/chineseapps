// ui.js - Control de interfaz de usuario
class UI {
    static showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla solicitada
        document.getElementById(`${screenId}-screen`).classList.add('active');
        this.currentScreen = screenId;
    }
    
    static showGameHeader(isGame) {
        const headerStats = document.getElementById('header-stats');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (isGame) {
            headerStats.style.display = 'flex';
            settingsBtn.style.display = 'none';
        } else {
            headerStats.style.display = 'none';
            settingsBtn.style.display = 'block';
        }
    }
    
    static showToast(message, duration = 2000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
    
    static updateLanguage(lang) {
        // Por implementar: actualizar todos los textos de la UI según el idioma seleccionado
        console.log("Idioma cambiado a:", lang);
    }
}
