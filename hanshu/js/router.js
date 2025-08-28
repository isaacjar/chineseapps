const routes = new Map();

export function register(route, render){
  routes.set(route, render);
}

export function navigate(route){
  const hash = '#' + route;
  if (location.hash === hash) {
    // 👇 fuerza render si ya estás en esa ruta
    render(route);
  } else {
    location.hash = hash;
  }
}

function render(route){
  const el = document.getElementById('view');
  const fn = routes.get(route);
  if(fn) fn(el);
  window.dispatchEvent(new CustomEvent('route-changed', { detail: { route }}));
}

export function onRouteChange(handler){
  window.addEventListener('route-changed', (e)=> handler(e.detail.route));
}

// 👇 importante: renderiza cuando cambia el hash
window.addEventListener('hashchange', ()=>{
  const route = location.hash.slice(1);
  render(route);
});

// 👇 importante: renderiza al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const route = location.hash.slice(1) || 'menu';
  render(route);
});

// 👇 expone navigate globalmente
window.navigate = navigate;
