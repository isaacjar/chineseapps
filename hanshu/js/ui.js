// ui.js
import { t } from './i18n.js';
import { currentScreen } from './router.js';
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
    return;
  }

  // Si estamos en un juego → título + HUD (vidas, progreso, timer)
  const session = getSession();
  hud.innerHTML = `
    <<div class="hud-center">	  
	  <span id="hud-progress">🌱 ${session.answered ?? 0}/${session.total ?? 0}</span>
	  <span id="hud-streak">🔥 ${session.streak ?? 0}</span>
	  <span id="hud-lives">❤️ ${session.lives ?? 0}</span>
	  <span id="hud-timer">
		<div id="hud-timer-knob"></div>
		<!--<div id="hud-timer-value">${session.time ?? ''}</div> -->
	  </span>
	</div>
    <div class="hud-right"></div> <!-- 👈 vacío, sin settings -->
  `;
}

// actualizar HUD con animación
export function updateHUD({ score, errors }) {
  if (score !== undefined) {
    $('#hud-score').fadeOut(100).text(score).fadeIn(100);
  }
  if (errors !== undefined) {
    $('#hud-errors').fadeOut(100).text(errors).fadeIn(100);
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

// Mensajes divertidos
const successMessages = [
  "🐼 ¡Genial!",
  "🎉 ¡Correcto!",
  "🌟 ¡Bien hecho!",
  "💡 ¡Lo pillaste!",
  "🥳 ¡Acertaste!"
];

const failMessages = [
  "😅 Uy, casi...",
  "❌ No pasa nada, sigue!",
  "🙈 ¡Fallaste!",
  "🍂 ¡Inténtalo otra vez!",
  "🤔 No era esa..."
];

export function showSuccessToast() {
  const msg = successMessages[Math.floor(Math.random() * successMessages.length)];
  showToast(msg, 'good');
}

export function showFailToast() {
  const msg = failMessages[Math.floor(Math.random() * failMessages.length)];
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
