// stats.js - Manejo de estadísticas
class Stats {
    static init() {
        // Inicializar event listeners para la pantalla de estadísticas
        document.addEventListener('DOMContentLoaded', () => {
            // Listener para cuando se muestra la pantalla de estadísticas
            const statsScreen = document.getElementById('stats-screen');
            if (statsScreen) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (statsScreen.classList.contains('active')) {
                                this.displayStats();
                            }
                        }
                    });
                });
                
                observer.observe(statsScreen, { attributes: true });
            }
        });
    }
    
    static displayStats() {
        const statsContainer = document.querySelector('.stats-container');
        if (!statsContainer) return;
        
        // Obtener estadísticas guardadas
        const savedStats = localStorage.getItem('hskBambooStats');
        const app = window.app;
        
        if (!savedStats || !app) {
            statsContainer.innerHTML = `
                <h2>${app?.languageData[app.settings.language]?.statsTitle || 'Estadísticas'}</h2>
                <p class="no-stats">${app?.languageData[app.settings.language]?.noStats || 'No hay estadísticas disponibles todavía. ¡Juega para generarlas!'}</p>
                <button id="back-from-stats" class="action-btn">${app?.languageData[app.settings.language]?.backToMenu || 'Volver al menú'}</button>
            `;
            
            // Reagregar el event listener al botón
            document.getElementById('back-from-stats').addEventListener('click', () => {
                UI.showScreen('menu');
            });
            
            return;
        }
        
        const statsData = JSON.parse(savedStats);
        const currentLang = app.settings.language;
        const langData = app.languageData[currentLang] || app.languageData.en;
        
        // Calcular métricas
        const totalWords = statsData.length;
        const wordsWithStats = statsData.filter(word => (word.s || 0) > 0).length;
        const totalAttempts = statsData.reduce((sum, word) => sum + (word.s || 0), 0);
        const totalErrors = statsData.reduce((sum, word) => sum + (word.e || 0), 0);
        const successRate = totalAttempts > 0 ? ((totalAttempts - totalErrors) / totalAttempts * 100).toFixed(1) : 0;
        
        // Palabras que necesitan práctica (más errores que aciertos o tasa de éxito < 50%)
        const needsPractice = statsData.filter(word => {
            const attempts = word.s || 0;
            const errors = word.e || 0;
            return attempts > 0 && (errors > attempts / 2 || (attempts - errors) / attempts < 0.5);
        });
        
        // Palabras dominadas (tasa de éxito > 80%)
        const masteredWords = statsData.filter(word => {
            const attempts = word.s || 0;
            const errors = word.e || 0;
            return attempts > 0 && (attempts - errors) / attempts > 0.8;
        });
        
        // Distribución por niveles HSK
        const levelDistribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        statsData.forEach(word => {
            if (word.level && levelDistribution.hasOwnProperty(word.level)) {
                levelDistribution[word.level]++;
            }
        });
        
        // Crear HTML para las estadísticas
        statsContainer.innerHTML = `
            <h2>${langData.statsTitle || 'Estadísticas'}</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${totalWords}</div>
                    <div class="stat-label">${langData.totalWords || 'Palabras totales'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${wordsWithStats}</div>
                    <div class="stat-label">${langData.wordsPracticed || 'Palabras practicadas'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${successRate}%</div>
                    <div class="stat-label">${langData.successRate || 'Tasa de acierto'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-value">${totalAttempts}</div>
                    <div class="stat-label">${langData.totalAttempts || 'Intentos totales'}</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>${langData.performanceByLevel || 'Rendimiento por nivel HSK'}</h3>
                <div class="level-stats">
                    ${Object.entries(levelDistribution).map(([level, count]) => `
                        <div class="level-stat">
                            <span class="level-label">HSK ${level}</span>
                            <div class="level-bar-container">
                                <div class="level-bar" style="width: ${(count / totalWords * 100)}%"></div>
                            </div>
                            <span class="level-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <h3>${langData.wordsToReview || 'Palabras para repasar'} <small>(${needsPractice.length})</small></h3>
                ${needsPractice.length > 0 ? `
                    <div class="review-words-list">
                        ${needsPractice.slice(0, 5).map(word => `
                            <div class="review-word-item">
                                <span class="word-ch">${word.ch}</span>
                                <span class="word-pinyin">${word.pin}</span>
                                <span class="word-translation">${word[currentLang] || (currentLang === 'es' ? word.sp : word.en)}</span>
                                <span class="word-stats">${word.s || 0}✓ ${word.e || 0}✗</span>
                            </div>
                        `).join('')}
                        ${needsPractice.length > 5 ? `
                            <p class="more-words">+ ${needsPractice.length - 5} ${langData.moreWords || 'más'}</p>
                        ` : ''}
                    </div>
                ` : `
                    <p class="no-words">${langData.noWordsToReview || '¡Excelente! No hay palabras que necesiten repaso.'}</p>
                `}
            </div>
            
            <div class="stats-actions">
                <button id="reset-stats" class="action-btn warning">${langData.resetStats || 'Reiniciar estadísticas'}</button>
                <button id="back-from-stats" class="action-btn">${langData.backToMenu || 'Volver al menú'}</button>
            </div>
        `;
        
        // Agregar event listeners
        document.getElementById('back-from-stats').addEventListener('click', () => {
            UI.showScreen('menu');
        });
        
        document.getElementById('reset-stats').addEventListener('click', () => {
            this.resetStats();
        });
    }
    
    static resetStats() {
        const app = window.app;
        const currentLang = app.settings.language;
        const langData = app.languageData[currentLang] || app.languageData.en;
        
        const message = langData.resetStatsConfirm || 
                       "¿Estás seguro de que quieres reiniciar todas las estadísticas? Esta acción no se puede deshacer.";
        
        if (confirm(message)) {
            localStorage.removeItem('hskBambooStats');
            
            // Resetear estadísticas en el vocabulario actual
            if (app.vocabulary) {
                app.vocabulary.forEach(word => {
                    word.s = 0;
                    word.e = 0;
                });
            }
            
            // Resetear estadísticas en caracteres si existen
            if (app.characters) {
                app.characters.forEach(char => {
                    char.s = 0;
                    char.e = 0;
                });
            }
            
            UI.showToast(langData.statsReset || 'Estadísticas reiniciadas correctamente');
            this.displayStats(); // Actualizar la visualización
        }
    }
}

// Inicializar el módulo de estadísticas
Stats.init();
