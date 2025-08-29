// menu.js
import { t } from './i18n.js';

/**
 * Renderiza el menú principal dentro de #view
 */
export function renderMenu() {
  const view = document.querySelector('#view');
  if (!view) return;

  view.innerHTML = `
    <section class="menu">
      <h2>${t('menu.title')}</h2>
      <p>${t('menu.subtitle')}</p>
      <div class="menu-grid">
        <a class="btn menu-btn" href="#recognition">🔢 ${t('menu.recognition')}</a>
        <a class="btn menu-btn" href="#reverse">✍️ ${t('menu.reverse')}</a>
        <a class="btn menu-btn" href="#pinyin-chars">✍️ ${t('menu.pinyinChars')}</a>
        <a class="btn menu-btn" href="#pinyin-digits">✍️ ${t('menu.pinyinDigits')}</a>
        <a class="btn menu-btn" href="#memory">🧠 ${t('menu.memory')}</a>
      </div>
    </section>
  `;
}
