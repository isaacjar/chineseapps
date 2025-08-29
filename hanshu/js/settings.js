// settings.js
import { getSettings, setSettings } from './state.js';
import { showModal, closeModal, renderHUD } from './ui.js';
import { setLang, getLang, t } from './i18n.js';

/**
 * Abre panel de configuración en un modal
 */
export function openSettings() {
  const s = getSettings();

  const content = `
    <h2>${t('ui.settings')}</h2>
    <form id="settings-form" class="settings-form">
      <label>
        🌎 ${t('ui.language')}
        <select name="lang">
          <option value="en" ${getLang() === 'en' ? 'selected' : ''}>English</option>
          <option value="es" ${getLang() === 'es' ? 'selected' : ''}>Español</option>
          <option value="zh" ${getLang() === 'zh' ? 'selected' : ''}>中文</option>
        </select>
      </label>

      <label>
        🔢 ${t('ui.range')}
        <select name="range">
          <option value="1-99" ${s.range === '1-99' ? 'selected' : ''}>1–99</option>
          <option value="100-999" ${s.range === '100-999' ? 'selected' : ''}>100–999</option>
          <option value="1000-9999" ${s.range === '1000-9999' ? 'selected' : ''}>1000–9999</option>
          <option value="10000-9999999" ${s.range === '10000-9999999' ? 'selected' : ''}>10,000–9,999,999</option>
        </select>
      </label>

      <label>
        ⏱️ ${t('ui.timePerQuestion')}
        <input type="number" name="qtime" min="3" max="60" value="${s.qtime}">
      </label>

      <label>
        ❓ ${t('ui.questionsPerGame')}
        <input type="number" name="qcount" min="5" max="50" value="${s.qcount}">
      </label>

      <div class="modal-actions">
        <button type="submit" class="btn">${t('ui.save')}</button>
        <button type="button" id="settings-cancel" class="btn btn-secondary">${t('ui.cancel')}</button>
      </div>
    </form>
  `;

  showModal(content);

  // listeners
  const form = document.querySelector('#settings-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const newSettings = {
      range: data.get('range'),
      qtime: parseInt(data.get('qtime'), 10),
      qcount: parseInt(data.get('qcount'), 10)
    };

    setSettings(newSettings);
    setLang(data.get('lang'));

    closeModal();
    renderHUD();
  });

  document.querySelector('#settings-cancel').addEventListener('click', () => {
    closeModal();
  });
}
