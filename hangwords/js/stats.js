// stats.js
const STATS_KEY = 'hangwords_stats_v1';

function loadStats() {
  const s = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  return { played: s.played || 0, correct: s.correct || 0, score: s.score || 0 };
}

function saveStatsToStorage(stats){ localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }

function resetStats(){
  localStorage.removeItem(STATS_KEY);
}

function updateStatsUI() {
  const s = JSON.parse(localStorage.getItem('hangwords_stats_v1') || '{}');
  const box = document.getElementById('settingsStats');
  if (!box) return;

  box.innerHTML = `
    <div>📦 Palabras jugadas: <b>${s.played || 0}</b></div>
    <div>✅ Palabras acertadas: <b>${s.correct || 0}</b></div>
    <div>🏆 Puntuación: <b>${s.score || 0}</b></div>
    <div style="color:#fff; opacity:0.05; margin-top:8px;">
      ${window.currentWord || ''}
    </div>
  `;
}
