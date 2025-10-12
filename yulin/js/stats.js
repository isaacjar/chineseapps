class Stats {
    constructor() {
        this.defaultStats = {
            totalWords: 0,
            correctAnswers: 0,
            gamesPlayed: 0
        };
        
        this.loadStats();
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('yulin-stats');
        if (savedStats) {
            this.stats = {...this.defaultStats, ...JSON.parse(savedStats)};
        } else {
            this.stats = {...this.defaultStats};
        }
    }
    
    saveStats() {
        localStorage.setItem('yulin-stats', JSON.stringify(this.stats));
    }
    
    recordAnswer(isCorrect) {
        this.stats.totalWords++;
        if (isCorrect) {
            this.stats.correctAnswers++;
        }
        this.saveStats();
    }
    
    recordGame() {
        this.stats.gamesPlayed++;
        this.saveStats();
    }
    
    getAccuracy() {
        if (this.stats.totalWords === 0) return 0;
        return Math.round((this.stats.correctAnswers / this.stats.totalWords) * 100);
    }
    
    updateUI() {
        document.getElementById('words-shown').textContent = this.stats.totalWords;
        document.getElementById('correct-answers').textContent = this.stats.correctAnswers;
        document.getElementById('accuracy-percentage').textContent = `${this.getAccuracy()}%`;
    }
    
    reset() {
        this.stats = {...this.defaultStats};
        this.saveStats();
        this.updateUI();
    }
}
