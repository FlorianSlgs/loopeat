
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
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5O7P6QRS.js"
    ],
    "route": "/utilisateurs/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/borrow/select"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CX7ZP4H3.js"
    ],
    "route": "/pro/give-back/validate"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-VGZKRKZZ.js"
    ],
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LGN7XAMX.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LGN7XAMX.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LGN7XAMX.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LGN7XAMX.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LGN7XAMX.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion/mdp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-KPPUIXTF.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion-pro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-KPPUIXTF.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion-pro/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-KPPUIXTF.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion-pro/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-KPPUIXTF.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion-pro/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-KPPUIXTF.js",
      "chunk-ATKPK77S.js"
    ],
    "route": "/connexion-pro/mdp"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 12840, hash: '72cc9198880d6407deac8a54cf6c308fcf8dd78aa760cea051a7cb31ca7b5d1f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2124, hash: '4a509872af4a3404da0a707ea145dbe760f410016f296b511f191075ca5ae4d2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69977, hash: '84a5eb9001186affcdfd2798e2f2d3c5f1099b7205b51e8b3a5a71877aa1f760', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
