// Funciones de interfaz de usuario
class UI {
  constructor() {}
  
  showToast(msg, ms = 1200) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.hidden = true;
    }, ms);
  }
  
  showFeedback(isCorrect) {
    const msg = isCorrect
      ? '✅ Correct! +10'
      : '❌ Incorrect! -2';
    this.showToast(msg);
  }
  
  performanceMessage(accuracy) {
    if (accuracy >= 90) return 'Great job! 🏅';
    if (accuracy >= 70) return 'Nice work! 💪';
    if (accuracy >= 50) return 'Keep going! 🚀';
    return 'Practice makes progress! 🌱';
  }
  
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// Instancia global de UI
const ui = new UI();
