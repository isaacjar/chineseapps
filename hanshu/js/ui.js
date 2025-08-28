import { t } from './i18n.js';
import { navigate } from './router.js';

const emojiTitle = '🐼⛰️🎋';

export function renderMenu(root){
  root.innerHTML = `
    <section class="menu">
      <div class="hero card">
        <h2>${t('menu.title')} ${emojiTitle}</h2>
        <p>${t('menu.subtitle')}</p>
      </div>
      <div class="actions grid">
        <button class="btn" data-route="game-recognition">
          <span>🔢</span><span>${t('menu.recognition')}</span><span>🍃</span>
        </button>
        <button class="btn btn-secondary" data-route="game-reverse">
          <span>✍️</span><span>${t('menu.reverse')}</span><span>🏯</span>
        </button>
        <button class="btn btn-accent" data-route="game-pinyin-from-chars">
          <span>✍️</span><span>${t('menu.pinyinChars')}</span><span>🎐</span>
        </button>
        <button class="btn" data-route="game-pinyin-from-digits">
          <span>✍️</span><span>${t('menu.pinyinDigits')}</span><span>🎑</span>
        </button>
        <button class="btn btn-ghost" data-route="game-memory">
          <span>🧠</span><span>${t('menu.memory')}</span><span>🌸</span>
        </button>
      </div>
    </section>
  `;

  root.querySelectorAll('button[data-route]').forEach(btn=>{
    btn.addEventListener('click', () => {
      const r = btn.getAttribute('data-route');
      navigate(r);
    });
  });
}

// HUD updates
export function updateHUD({ score, streak, lives }){
  document.getElementById('hud-score').textContent = `🏅 ${score}`;
  document.getElementById('hud-streak').textContent = `🔥 ${streak}`;
  document.getElementById('hud-lives').textContent = `❤️ ${lives}`;
}

// Notifications (lightweight)
export function toast(message, tone=''){
  const el = document.createElement('div');
  el.className = `badge ${tone}`;
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.bottom = '20px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.zIndex = '9999';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1400);
}
