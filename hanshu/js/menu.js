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
        <button class="btn menu-btn" data-screen="recognition">🧮 Guess the number (hanzis)</button>
        <button class="btn menu-btn" data-screen="pinyinDigits">🔢 Guess the number (pinyin)</button>
        <button class="btn menu-btn" data-screen="reverse">🀄 Guess the character</button>
        <button class="btn menu-btn" data-screen="pinyinChars">🗣️ Guess the pronunciation</button>
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
