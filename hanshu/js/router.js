const routes = new Map();

export function register(route, render){
  routes.set(route, render);
}

export function navigate(route){
  location.hash = '#' + route;
  render(route);
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

window.addEventListener('hashchange', ()=>{
  const route = location.hash.slice(1);
  const fn = routes.get(route);
  if(fn) fn(document.getElementById('view'));
});
window.navigate = navigate;
