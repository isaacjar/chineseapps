const STATS_KEY = 'hangwords_stats_v1';
function loadStats(){
  return JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
}

/*function saveStats(stats){
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}*/
function saveStatsToStorage(stats){ localStorage.setItem(STATS_KEY, JSON.stringify(stats)); localStorage.setItem('hangwords_stats_v1', JSON.stringify(stats));}

function resetStats(){
  localStorage.removeItem(STATS_KEY);
}
function updateStatsUI(){
  const s = loadStats();
  const container = document.getElementById('statsContainer');
  container.innerHTML = '';
  container.innerHTML = `
    <div>Words played: ${s.played || 0}</div>
    <div>Correct: ${s.correct || 0}</div>
    <div>Incorrect: ${s.incorrect || 0}</div>
    <div>Accuracy: ${((s.correct||0) / Math.max(1,(s.played||0)) * 100).toFixed(1)}%</div>
  `;
}
