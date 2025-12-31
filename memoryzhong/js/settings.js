export const DEFAULTS = {
  lang: "zh",
  numwords: 6,
  timemem: 10,
  time: 60,
  showOrdered: true,
  stats: {
    played: 0,
    won: 0
  }
};

export const Settings = {
  data: {},

  init(urlParams){
    // 1️⃣ defaults
    this.data = structuredClone(DEFAULTS);

    // 2️⃣ localStorage
    const saved = JSON.parse(localStorage.getItem("memoryzhong-settings"));
    if(saved){
      Object.assign(this.data, saved);
      if(saved.stats){
        this.data.stats = saved.stats;
      }
    }

    // 3️⃣ URL params (máxima prioridad)
    for(const [k,v] of urlParams.entries()){
      if(k in this.data){
        this.data[k] = isNaN(v) ? v : Number(v);
      }
    }

    this.validate();
  },

  validate(){
    this.data.numwords = Math.min(25, Math.max(4, this.data.numwords));
    this.data.timemem = Math.min(60, Math.max(5, this.data.timemem));
    this.data.time = Math.min(600, Math.max(30, this.data.time));
  },

  save(){
    localStorage.setItem(
      "memoryzhong-settings",
      JSON.stringify(this.data)
    );
  },

  reset(){
    this.data = structuredClone(DEFAULTS);
    this.save();
  }
};
