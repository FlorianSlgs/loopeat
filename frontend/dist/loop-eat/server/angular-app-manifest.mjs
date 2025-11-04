
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
    'index.csr.html': {size: 12407, hash: '541e60c4b2131287bf3dc9cdba33d26157836776f0ff99b89947abece0092e9d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1691, hash: '93dba1e3e6f04e0cff5b30b862eac9a83285657d4c8ceed86c69f58ea802f9ce', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69553, hash: 'd388e9c8001f2cce75fec3865fa6f75975643978d26a72b16767d384bfa5c40a', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
