
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 1,
    "redirectTo": "/utilisateurs/dashboard",
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "route": "/utilisateurs/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "redirectTo": "/pro/dashboard",
    "route": "/pro"
  },
  {
    "renderMode": 1,
    "route": "/pro/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/pro/parametres"
  },
  {
    "renderMode": 1,
    "route": "/pro/historique"
  },
  {
    "renderMode": 1,
    "route": "/pro/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "route": "/pro/borrow/select"
  },
  {
    "renderMode": 1,
    "route": "/pro/give-back/validate"
  },
  {
    "renderMode": 1,
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "route": "/connexion"
  },
  {
    "renderMode": 1,
    "route": "/connexion/mot-de-passe"
  },
  {
    "renderMode": 1,
    "route": "/connexion/verification"
  },
  {
    "renderMode": 1,
    "route": "/connexion/nom"
  },
  {
    "renderMode": 1,
    "route": "/connexion/mdp"
  },
  {
    "renderMode": 1,
    "route": "/connexion-pro"
  },
  {
    "renderMode": 1,
    "route": "/connexion-pro/mot-de-passe"
  },
  {
    "renderMode": 1,
    "route": "/connexion-pro/verification"
  },
  {
    "renderMode": 1,
    "route": "/connexion-pro/nom"
  },
  {
    "renderMode": 1,
    "route": "/connexion-pro/mdp"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 11347, hash: '58a1938821852b9cce4f41332b9e240a2b0627ca13d78ad4738efaa7f75c62da', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1691, hash: '06b8a6681ee2cfcffd9b0be176559572213887f01d9bd0160c8874794541c0d7', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 68438, hash: '6b81c312ef4de625db52ac54a42af56646c8345ee3d438ced852fe8e7f173502', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-EGI4ICKQ.css': {size: 57999, hash: 'MexzR7YyW/Y', text: () => import('./assets-chunks/styles-EGI4ICKQ_css.mjs').then(m => m.default)}
  },
};
