import { getSettings, updateSettings, getSession, resetSession } from './state.js';
import { t, setLanguage, currentLangCode } from './i18n.js';
import { navigate } from './router.js';

function renderSettings(){
  const s = getSettings();

  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-header">
          <h3>${t('settings.title')}</h3>
          <button class="btn btn-ghost" id="btn-close-modal">✖</button>
        </div>
        <div class="modal-body">
          <div class="grid grid-2">
            <div class="field">
              <label>${t('settings.language')}</label>
              <select id="st-lang">
                <option value="en">English 🇬🇧</option>
                <option value="es">Español 🇪🇸</option>
                <option value="fr">Français 🇫🇷</option>
                <option value="pt">Português 🇵🇹🇧🇷</option>
                <option value="de">Deutsch 🇩🇪</option>
                <option value="ur">اردو 🇵🇰</option>
              </select>
            </div>

            <div class="field">
              <label>${t('settings.pinyin')}</label>
              <select id="st-pinyin">
                <option value="true">On ✅</option>
                <option value="false">Off ❌</option>
              </select>
            </div>

            <div class="field">
              <label>${t('settings.range')}</label>
              <select id="st-range">
                <option value="1-10">${t('settings.ranges.r1_10')}</option>
                <option value="11-99">${t('settings.ranges.r11_99')}</option>
                <option value="100-999">${t('settings.ranges.r100_999')}</option>
                <option value="1000+">${t('settings.ranges.r1000p')}</option>
              </select>
            </div>

            <div class="field">
              <label>${t('settings.qcount')}</label>
              <input id="st-qcount" class="input" type="number" min="3" max="25" />
            </div>

            <div class="field">
              <label>${t('settings.qtime')}</label>
              <input id="st-qtime" class="input" type="number" min="1" max="20" />
            </div>

            <div class="field">
              <label>${t('settings.fails')}</label>
              <input id="st-fails" class="input" type="number" min="0" max="${s.questionCount}" />
              <small class="muted">Max = current questions</small>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="btn-cancel">${t('ui.cancel')}</button>
          <button class="btn" id="btn-save">${t('ui.save')}</button>
        </div>
      </div>
    </div>
  `;

  // Prefill
  root.querySelector('#st-lang').value = currentLangCode();
  root.querySelector('#st-pinyin').value = String(!!s.pinyinHints);
  root.querySelector('#st-range').value = s.range;
  root.querySelector('#st-qcount').value = s.questionCount;
  root.querySelector('#st-qtime').value = s.timePerQuestion;
  root.querySelector('#st-fails').value = s.allowedFails;

  // Events
  root.querySelector('#btn-close-modal').addEventListener('click', close);
  root.querySelector('#btn-cancel').addEventListener('click', close);
  root.querySelector('#btn-save').addEventListener('click', async () => {
	  const lang = root.querySelector('#st-lang').value;
	  const pinyinHints = root.querySelector('#st-pinyin').value === 'true';
	  const range = root.querySelector('#st-range').value;
	  const questionCount = clamp(parseInt(root.querySelector('#st-qcount').value || 10), 3, 25);
	  const timePerQuestion = clamp(parseInt(root.querySelector('#st-qtime').value || 10), 1, 20);
	  const allowedFails = clamp(parseInt(root.querySelector('#st-fails').value || 3), 0, questionCount);

	  const s = getSettings();
	  const sess = getSession();
	  const wasPlaying = sess.current > 0 || sess.correct > 0;
	  const rangeChanged = range !== s.range;
	  const countChanged = questionCount !== s.questionCount;

	  if (wasPlaying && (rangeChanged || countChanged)) {
		resetSession();
	  }

	  updateSettings({ pinyinHints, range, questionCount, timePerQuestion, allowedFails });
	  await setLanguage(lang);
	  close();
	  navigate('menu');
	});
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function close(){
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
}

export function initSettings(){
  window.addEventListener('open-settings', renderSettings);
  window.addEventListener('lang-changed', renderSettings);
}
