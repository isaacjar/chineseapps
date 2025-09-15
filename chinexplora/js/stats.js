// Estadísticas del usuario
let userStats = {
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    bestStreak: 0
};

// Cargar estadísticas desde localStorage
function loadStats() {
    const savedStats = localStorage.getItem('chinexplora_stats');
    if (savedStats) {
        userStats = JSON.parse(savedStats);
    }
    
    // Actualizar UI si la pantalla de estadísticas está visible
    if (!document.getElementById('statsScreen').classList.contains('hidden')) {
        updateStatsDisplay();
    }
}

// Guardar estadísticas
function saveStats() {
    // Actualizar estadísticas con la partida actual
    userStats.totalQuestions += currentQuestion;
    userStats.correctAnswers += Math.floor(score / 10);
    userStats.totalPoints += score;
    if (bestStreak > userStats.bestStreak) {
        userStats.bestStreak = bestStreak;
    }
    
    localStorage.setItem('chinexplora_stats', JSON.stringify(userStats));
}

// Mostrar estadísticas
function showStats() {
    loadStats();
    updateStatsDisplay();
    showScreen('statsScreen');
}

// Actualizar visualización de estadísticas
function updateStatsDisplay() {
    const statPercentage = document.getElementById('statPercentage');
    const statTotalPoints = document.getElementById('statTotalPoints');
    const statBestStreak = document.getElementById('statBestStreak');
    
    const percentage = userStats.totalQuestions > 0 
        ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) 
        : 0;
    
    statPercentage.textContent = `${percentage}%`;
    statTotalPoints.textContent = userStats.totalPoints;
    statBestStreak.textContent = userStats.bestStreak;
}

// Reiniciar estadísticas
function resetStats() {
    userStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        totalPoints: 0,
        bestStreak: 0
    };
    
    localStorage.setItem('chinexplora_stats', JSON.stringify(userStats));
    updateStatsDisplay();
}
