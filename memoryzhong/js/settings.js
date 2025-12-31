export const DEFAULTS = {
  lang: "zh",
  numwords: 6,
  timemem: 10,
  time: 60,
  showOrdered: true
};

export const Settings = {
  data: {},

  init(urlParams){
    this.data = {...DEFAULTS};

    // localStorage
    const saved = JSON.parse(localStorage.getItem("memoryzhong-settings"));
    if(saved) Object.assign(this.data, saved);

    // URL params (máxima prioridad)
    for(const [k,v] of urlParams.entries()){
      if(k in this.data){
        this.data[k] = isNaN(v) ? v : Number(v);
      }
    }
  },

  save(){
    localStorage.setItem("memoryzhong-settings", JSON.stringify(this.data));
  }
};
  
