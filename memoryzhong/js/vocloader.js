/* vocloader.js
   Carga vocabularios remotos con o sin extensión
   y normaliza el formato para el juego
*/

export async function loadVoclist(url){
  const res = await fetch(url);
  if(!res.ok){
    throw new Error("No se pudo cargar el vocabulario: " + url);
  }

  let data;

  // 🇨🇳 JSON real
  if(url.endsWith(".json")){
    data = await res.json();
  }
  // 🌍 sin extensión → texto parseable
  else{
    const txt = await res.text();
    data = JSON.parse(txt);
  }

  return normalizeVoc(data);
}

/* =========================
   Normalización
   Salida común:
   { ch, pin, es, en }
========================= */
function normalizeVoc(list){
  return list.map(w=>{

    // 🇨🇳 Chino HSK
    if(w.ch && w.pin){
      return {
        ch: w.ch,
        pin: w.pin,
        es: w.es || "",
        en: w.en || ""
      };
    }

    // 🌍 Multidioma (es/en/zh/fr…)
    return {
      ch: w.zh || "",
      pin: "",
      es: w.es || "",
      en: w.en || ""
    };
  });
}
