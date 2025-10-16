// Manejo de la interfaz de usuario (modal, etc.)

// Inicializar UI
function initUI() {
    setupModal();
}

// Configurar el modal
function setupModal() {
    const modal = document.getElementById('textModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelTextBtn');
    const confirmBtn = document.getElementById('confirmTextBtn');
    
    // Cerrar modal
    function closeModal() {
        modal.style.display = 'none';
        document.getElementById('textInput').value = '';
    }
    
    // Event listeners para cerrar modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('click', (event) => {
        const groupModal = document.getElementById('groupModal');
        if (event.target === groupModal) {
            groupModal.style.display = 'none';
        }
    });
    
    // Confirmar texto
    confirmBtn.addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim();
        if (text) {
            // Usar .then() en lugar de await
            processText(text).then(newChars => {
                appState.characters = newChars;
                saveStateToStorage();
                renderBubbles();
                closeModal();
            });
        }
    });
    
    // Permitir enviar con Enter
    document.getElementById('textInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            confirmBtn.click();
        }
    });
}

// Inicializar UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initUI);
