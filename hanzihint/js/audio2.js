// audio2.js
(() => {
  "use strict";

  const STORAGE_KEY = "hanziclash-sound-enabled";
  const BASE_PATH = "sounds/";

  const FILES = {
    correct: "correct.mp3",
    wrong: "wrong.mp3",
    skip: "click.mp3",
    phraseComplete: "phrase-complete.mp3",
    victory: "victory.mp3"
  };

  const PRIORITY = {
    correct: 1,
    wrong: 1,
    skip: 1,
    phraseComplete: 2,
    victory: 3
  };

  const sounds = {};
  let enabled = true;
  let currentSound = null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) enabled = saved === "true";
  } catch (_) {
    // Si el almacenamiento no está disponible, usar el valor predeterminado.
  }

  function init() {
    Object.entries(FILES).forEach(([name, file]) => {
      const audio = new Audio(BASE_PATH + file);
      audio.preload = "none"; // audio.preload = "auto";
      audio.volume = name === "wrong" ? 0.65 : 0.75;
      sounds[name] = audio;
    });
  }

  function stop() {
    if (!currentSound) return;

    currentSound.pause();

    try {
      currentSound.currentTime = 0;
    } catch (_) {
      // El archivo puede no haberse cargado todavía.
    }

    currentSound = null;
  }

  function play(name) {
    if (!enabled || !sounds[name]) return;

    if (currentSound) {
      const currentName = currentSound.dataset.soundName;
      if ((PRIORITY[currentName] || 0) > (PRIORITY[name] || 0)) {
        return;
      }
      stop();
    }

    const audio = sounds[name];
    currentSound = audio;
    audio.dataset.soundName = name;

    try {
      audio.currentTime = 0;
    } catch (_) {
      // La reproducción intentará comenzar desde el inicio.
    }

    const playback = audio.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {
        if (currentSound === audio) currentSound = null;
      });
    }

    audio.onended = () => {
      if (currentSound === audio) currentSound = null;
    };
  }

  function setEnabled(value) {
    enabled = Boolean(value);

    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (_) {
      // El sonido sigue funcionando aunque no se pueda guardar la preferencia.
    }

    if (!enabled) stop();

    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  window.HanziClashAudio = {
    init,
    play,
    stop,
    setEnabled,
    isEnabled
  };
})();
