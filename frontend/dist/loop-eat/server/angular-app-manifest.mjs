
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
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
    ],
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-J3CJIZIW.js"
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
    'index.csr.html': {size: 12840, hash: 'ba2a5839e19f1f01adf7feea88f394f48d11c1ac2383f40f30a5b8a9427a9a14', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2124, hash: 'c4fec3db7f1554b5a1e88198197c8574217d17e3040a86db62d6c2ec53934820', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69977, hash: '75ab327b16387d6477254b1a81f4aa232146afa6d572695e163553c726b851f7', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
