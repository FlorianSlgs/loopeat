
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
    'index.csr.html': {size: 12407, hash: '9b9cfdf48eac55de946ebd45d02f6df53b979cdadeb8d9d6054f88b33da0f906', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1691, hash: '1854b836558fccb016153d70ab829d84c257a791b26d8010645994aeddc3c49c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69553, hash: '1b4fca6ab6453828813a251e0b42eae032f3648a5090453dd117190cd537010d', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
