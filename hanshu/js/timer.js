// timer.js

/**
 * Crea un temporizador visual con barra de progreso
 * 
 * @param {HTMLElement} container - contenedor donde renderizar
 * @param {number} duration - segundos totales
 * @param {function} onTimeout - callback al expirar
 * @returns {{ stop: Function, timeLeft: number }}
 */
export function createTimer(container, duration, onTimeout) {
  if (!container) return { stop: () => {}, timeLeft: duration };

  let timeLeft = duration;
  let intervalId = null;

  container.innerHTML = `
    <div class="timer-bar">
      <div class="timer-fill"></div>
      <span class="timer-label">${timeLeft}</span>
    </div>
  `;

  const fill = container.querySelector('.timer-fill');
  const label = container.querySelector('.timer-label');

  function update() {
    timeLeft--;
    const percent = (timeLeft / duration) * 100;
    fill.style.width = percent + "%";
    label.textContent = timeLeft;

    if (timeLeft <= 0) {
      stop();
      if (typeof onTimeout === 'function') onTimeout();
    }
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  // iniciar
  intervalId = setInterval(update, 1000);

  return {
    stop,
    get timeLeft() {
      return timeLeft;
    }
  };
}
