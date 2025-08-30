// ui.js
import { translations } from './i18n.js';
import { currentScreen, navigate } from './router.js';
import { getSession } from './state.js';

let timerInterval = null; // referencia para limpiar el contador si cambia de pantalla

// ======= HUD =======
export function renderHUD() {
  const hud = document.querySelector('#hud');
  if (!hud) return;
  
  // Si estamos en menú o en settings → solo título + botón settings
  if (currentScreen === 'menu' || currentScreen === 'settings') {
    hud.innerHTML = `      
      <div class="hud-right">
        <button id="hud-settings" class="btn">⚙️</button>
      </div>
    `;
	const btn = document.getElementById('hud-settings');
	if (btn) btn.addEventListener('click', () => navigate('settings'));
    return;
  }

  // Si estamos en un juego → título + HUD (vidas, progreso, timer)
  const session = getSession();
  hud.innerHTML = `
    <div class="hud-center">	  
	  <span id="hud-progress">🌱 ${session.answered ?? 0}/${session.total ?? 0}</span>
	  <span id="hud-streak">🔥 ${session.streak ?? 0}</span>
	  <span id="hud-lives">❤️ ${session.lives ?? 0}</span>
	  <span id="hud-timer">
		<span id="hud-timer-knob"></span>
		<!--<div id="hud-timer-value">${session.time ?? ''}</div> -->
	  </span>
	</div>
    <div class="hud-right"></div> <!-- 👈 vacío, sin settings -->
  `;
}

// actualizar HUD con animación
export function updateHUD({ score, errors, streak, bestStreak, lives }) {
  
  if (streak !== undefined) {
    $('#hud-streak').fadeOut(100).text(`🔥 ${streak}`).fadeIn(100);
  }
  
  if (lives !== undefined) {
    $('#hud-lives').fadeOut(100).text(`❤️ ${lives}`).fadeIn(100);
  }
}

// ======= Progreso de preguntas =======
export function updateProgress(current, total) {
  $('#hud-progress').fadeOut(100).text(`🌱 ${current}/${total}`).fadeIn(100);
}

// ======= Timer de juego con knob circular =======
export function initGameTimer(totalSeconds, onTimeUp) {
  // limpiar cualquier timer anterior
  if (timerInterval) clearInterval(timerInterval);

  $("#hud-timer-knob").roundSlider({
    radius: 35,
    width: 6,
    handleSize: "+6",
    min: 0,
    max: totalSeconds,
    value: totalSeconds,
    circleShape: "half-top",
    sliderType: "min-range",
    readOnly: true
  });

  $('#hud-timer-value').text(totalSeconds + 's');

  let remaining = totalSeconds;
  timerInterval = setInterval(() => {
    remaining--;
    $("#hud-timer-knob").roundSlider("setValue", remaining);
    $('#hud-timer-value').text(remaining + 's');

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (onTimeUp) onTimeUp();
    }
  }, 1000);

  return timerInterval;
}

// ======= Toasts =======
export function showToast(msg, type = 'info') {
  const container = document.querySelector('#toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  // animación con jQuery
  $(toast).hide().fadeIn(200).delay(2000).fadeOut(400, function () {
    $(this).remove();
  });
}

// Mensajes divertidos desde lang.json (objetos → arrays) 🥳🎉
const successMessages = Object.values(t('successMessages'));
const failMessages = Object.values(t('failMessages'));
function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function showSuccessToast() {
  const msg = getRandomMessage(successMessages); 
  showToast(msg, 'good');
}

export function showFailToast() {
  const msg = getRandomMessage(failMessages); 
  showToast(msg, 'warn');
}

// ======= Modal =======
export function showModal(content, onOpen) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML = content;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // animación con jQuery
  $(overlay).hide().fadeIn(200);
  $(box).hide().slideDown(250);

  if (onOpen) onOpen();
}

export function closeModal() {
  $('#modal-overlay').fadeOut(200, function () {
    $(this).remove();
  });
}

// ======= Navegación suave entre pantallas =======
export function smoothNavigate(renderFn) {
  const view = $('#view');

  // parar cualquier timer activo al cambiar de pantalla
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  view.fadeOut(200, () => {
    view.empty();
    renderFn();
    view.fadeIn(200);
  });
}

// escucha el evento y repinta el HUD
window.addEventListener('app:navigated', () => {
  renderHUD(); // Recalcula el HUD según currentScreen
});

export function updateHeaderTexts() {
  document.getElementById('app-subtitle').textContent = t('ui.appsubtitle');
}