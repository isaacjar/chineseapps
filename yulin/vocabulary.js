// Gestión de vocabulario
class VocabularyManager {
  constructor() {
    this.vocabulary = [];
    this.currentVocabulary = [];
    this.currentListName = '';
  }
  
  loadList(name, title) {
    fetch(`https://isaacjar.github.io/chineseapps/voclists/${name}.json`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Archivo no encontrado: ${name}.json`);
        }
        return res.json();
      })
      .then(data => {
        this.vocabulary = data;
        this.currentVocabulary = data;
        this.currentListName = title;
        document.getElementById('title').textContent = `${title}`;
      })
      .catch(err => {
        console.error("Error al cargar el listado:", err);
        ui.showToast("Error loading vocabulary list");
        this.loadIndexAndShowPopup();
      });
  }
  
  loadIndexAndShowPopup() {
    const script = document.createElement("script");
    script.src = "https://isaacjar.github.io/chineseapps/voclists/index.js";
    script.onload = () => this.showPopup(voclists);
    document.head.appendChild(script);
  }
  
  showPopup(lists) {
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "10%";
    popup.style.left = "10%";
    popup.style.width = "80%";
    popup.style.height = "80%";
    popup.style.overflowY = "scroll";
    popup.style.backgroundColor = "#fff";
    popup.style.border = "2px solid #333";
    popup.style.padding = "20px";
    popup.style.zIndex = "9999";
    
    const title = document.createElement("h2");
    title.textContent = "Select Vocabulary List";
    popup.appendChild(title);
    
    lists.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = `${item.title} (${item.level})`;
      btn.style.display = "block";
      btn.style.margin = "10px 0";
      btn.onclick = () => {
        popup.remove();
        this.loadList(item.filename, item.title);
      };
      popup.appendChild(btn);
    });
    
    document.body.appendChild(popup);
  }
}

// Instancia global del gestor de vocabulario
const vocabularyManager = new VocabularyManager();
