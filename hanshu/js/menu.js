// menu.js
import { navigate } from './router.js';
import { t } from './i18n.js';

/**
 * Renderiza el menú principal dentro de #view
 */
export function renderMenu() {
  const view = document.querySelector('#view');
  view.innerHTML = `
    <section class="menu">
      <h2>${t('ui.chooseGame')}</h2>
      <div class="menu-grid">
        <button class="btn menu-btn" data-screen="recognition">🔢 ${t('menu.recognition')}</button>
        <button class="btn menu-btn" data-screen="reverse">✍️ ${t('menu.reverse')}</button>
        <button class="btn menu-btn" data-screen="pinyinChars">✍️ ${t('menu.pinyinChars')}</button>
        <button class="btn menu-btn" data-screen="pinyinDigits">✍️ ${t('menu.pinyinDigits')}</button>
      </div>
    </section>
  `;

  // listeners de navegación
  view.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.screen);
    });
  });
}
