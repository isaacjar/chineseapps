import { register } from './router.js';

register('menu', (root) => {
  root.innerHTML = `
    <section class="menu-screen" style="text-align: center; padding: 40px;">
      <h2 style="font-size: 2em;">📚 Elige tu modo de juego</h2>
      <button class="btn" onclick="navigate('game-recognition')">🎯 Visual</button>
      <button class="btn" onclick="navigate('game-writing')">✍️ Escritura</button>
      <button class="btn" onclick="navigate('game-listening')">🎧 Escucha</button>
    </section>
  `;
});
