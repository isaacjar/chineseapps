// settings.js
import { getSettings, setSettings, saveState, resetSettings } from './state.js';
import { t } from './i18n.js';
import { closeModal } from './ui.js';

export function initSettingsTrigger() {
  const langHud = document.getElementById('hud-language');
  if (langHud) {
    langHud.addEventListener('click', () => {
      openSettings();
    });
  }
}

export function openSettings() {
  const s = getSettings();  
  const content = `
    <h2 style="margin-bottom: 10px;">${t('settings.title')}</h2>
    <form id="settings-form" class="settings-form">
      
      <!-- Idioma -->
      <div class="settings-item">
        <label for="language">${t('settings.language')}</label>
        <select name="language" id="language">
          <option value="en">🇬🇧 English</option>
          <option value="es">🇪🇸 Español</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="pt">🇵🇹 Português</option>
          <option value="ur">🇵🇰 اردو</option>
        </select>
      </div>
	
	<!-- Rango de números -->
      <div class="settings-item">
        <label for="range">${t('settings.range')}</label>
        <select id="range" name="range">
          <option value="r1_10" ${s.range === 'r1_10' ? 'selected' : ''}>${t('settings.r1_10')}</option>
          <option value="r11_99" ${s.range === 'r11_99' ? 'selected' : ''}>${t('settings.r11_99')}</option>
          <option value="r100_999" ${s.range === 'r100_999' ? 'selected' : ''}>${t('settings.r100_999')}</option>
          <option value="r1000_9999" ${s.range === 'r1000_9999' ? 'selected' : ''}>${t('settings.r1000_9999')}</option>
          <option value="r10000_9999999" ${s.range === 'r10000_9999999' ? 'selected' : ''}>${t('settings.r10000_9999999')}</option>
        </select>
      </div>

      <!-- Preguntas: slider -->
      <div class="settings-item">
        <label for="qcount">${t('settings.qcount')}</label>
        <input type="range" id="qcount" name="qcount" min="5" max="40" step="5" value="${s.qcount}">
        <span id="qcount-value">${s.qcount}</span>
      </div>

      <!-- Tiempo: knob circular -->
      <div class="settings-item">
        <label>${t('settings.qtime')}</label>
        <span id="qtime-knob"></span>
        <!--<span id="qtime-value">${s.qtime}s</span>-->
        <input type="hidden" id="qtime" name="qtime" value="${s.qtime}">
      </div>

      <!-- Errores: stepper -->
      <div class="settings-item">
        <label for="fails">${t('settings.fails')}</label>
        <span class="stepper">
          <button type="button" class="btn-step" data-action="decrease">–</button>
          <span id="fails-value">${s.fails}</span>
          <button type="button" class="btn-step" data-action="increase">+</button>
        </span>
        <input type="hidden" id="fails" name="fails" value="${s.fails}">
      </div>

      <!-- Dificultad: switch -->
      <div class="settings-item">
        <label>${t('settings.difficulty')}</label>
		<span id="difficulty-emoji">${s.difficulty === 2 ? '🥵' : '😎'}</span>
        <label class="switch">
          <input type="checkbox" id="difficulty" name="difficulty" ${s.difficulty === 2 ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <!-- Botones -->
      <div class="settings-actions">
        <button type="submit" class="btn btn-primary">${t('ui.save')}</button>
        <button type="button" id="settings-reset" class="btn btn-warn">🔄 ${t('ui.reset')}</button>
        <button type="button" id="settings-cancel" class="btn btn-secondary">${t('ui.cancel')}</button>
      </div>
    </form>
  `;
  
  // ⚠️ Inserta el HTML en el contenedor
  document.getElementById('modal-root').innerHTML = content;
  
// ===== DIFICULTAD =====
	const diffInput = document.getElementById('difficulty');
	const diffEmoji = document.getElementById('difficulty-emoji');

	diffInput.addEventListener('change', () => {
		diffEmoji.textContent = diffInput.checked ? '🥵' : '😎';
	});

  import('./ui.js').then(({ showModal }) => {
    showModal(content, () => {});
    const form = document.querySelector('#settings-form');
    form.language.value = s.language;

    // ===== Preguntas slider =====
    const qcountInput = form.querySelector('#qcount');
    const qcountValue = form.querySelector('#qcount-value');
    qcountInput.addEventListener('input', () => {
      qcountValue.textContent = qcountInput.value;
    });

    // ===== Errores stepper =====
    const failsHidden = form.querySelector('#fails');
    const failsValue = form.querySelector('#fails-value');
    form.querySelectorAll('.btn-step').forEach(btn => {
      btn.addEventListener('click', () => {
        let val = parseInt(failsHidden.value);
        if (btn.dataset.action === 'decrease' && val > 0) val--;
        if (btn.dataset.action === 'increase' && val < 10) val++;
        failsHidden.value = val;
        failsValue.textContent = val;
      });
    });

    // ===== Tiempo knob circular =====
    $("#qtime-knob").roundSlider({
      radius: 60,
      width: 10,
      handleSize: "+8",
      min: 2,
      max: 30,
      value: s.qtime,
      step: 1,
      circleShape: "pie",
      startAngle: 315,
      sliderType: "min-range",
      change: function (args) {
        document.querySelector('#qtime').value = args.value;
        document.querySelector('#qtime-value').textContent = args.value + 's';
      }
    });

    // ===== Guardar cambios =====
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);

      setSettings({
        ...s,
        language: data.get('language'),
		range: data.get('range'),
        qcount: parseInt(data.get('qcount')),
        qtime: parseInt(data.get('qtime')),
        fails: parseInt(data.get('fails')),
        difficulty: data.get('difficulty') ? 2 : 1
      });

      saveState();
      closeModal();
      location.reload();
    });

    // ===== Reset con confirmación =====
    document.querySelector('#settings-reset').addEventListener('click', () => {
      if (confirm(t('settings.resetConfirm') || 'Are you sure you want to reset to default settings?')) {
        resetSettings();
        closeModal();
        location.reload();
      }
    });

    // ===== Cancelar =====
    document.querySelector('#settings-cancel').addEventListener('click', () => {
      closeModal();
    });
  });
}
