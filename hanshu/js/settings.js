// settings.js
import { getSettings, setSettings, saveState, resetSettings } from './state.js';
import { t } from './i18n.js';
import { closeModal } from './ui.js';

export function openSettings() {
  const s = getSettings();

  const content = `
    <h2>${t('settings.title')}</h2>
    <form id="settings-form" class="settings-form">
      
      <div class="settings-item">
        <label>
          ${t('settings.language')}
          <select name="language">
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="pt">🇵🇹 Português</option>
            <option value="ur">🇵🇰 اردو</option>
          </select>
        </label>
      </div>

      <div class="settings-item">
        <label>
          ${t('settings.qcount')}
          <input type="number" name="qcount" min="1" max="50" value="${s.qcount}">
        </label>
      </div>

      <div class="settings-item">
        <label>
          ${t('settings.qtime')}
          <input type="number" name="qtime" min="2" max="30" value="${s.qtime}">
        </label>
      </div>

      <div class="settings-item">
        <label>
          ${t('settings.fails')}
          <input type="number" name="fails" min="0" max="10" value="${s.fails}">
        </label>
      </div>

      <div class="settings-item">
        <label>
          ${t('settings.difficulty')}
          <label class="switch">
            <input type="checkbox" name="difficulty" ${s.difficulty === 2 ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </label>
      </div>

      <div class="settings-actions">
        <button type="submit" class="btn btn-primary">${t('ui.save')}</button>
        <button type="button" id="settings-reset" class="btn btn-warn">🔄 ${t('ui.reset')}</button>
        <button type="button" id="settings-cancel" class="btn btn-secondary">${t('ui.cancel')}</button>
      </div>
    </form>
  `;

  import('./ui.js').then(({ showModal }) => {
    showModal(content, () => {});
    const form = document.querySelector('#settings-form');
    form.language.value = s.language;

    // Guardar cambios
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);

      setSettings({
        ...s,
        language: data.get('language'),
        qcount: parseInt(data.get('qcount')),
        qtime: parseInt(data.get('qtime')),
        fails: parseInt(data.get('fails')),
        difficulty: data.get('difficulty') ? 2 : 1
      });

      saveState();
      closeModal();
      location.reload();
    });

    // Resetear ajustes con confirmación
    document.querySelector('#settings-reset').addEventListener('click', () => {
      if (confirm(t('settings.resetConfirm') || 'Are you sure you want to reset to default settings?')) {
        resetSettings();
        closeModal();
        location.reload();
      }
    });

    // Cancelar
    document.querySelector('#settings-cancel').addEventListener('click', () => {
      closeModal();
    });
  });
}
