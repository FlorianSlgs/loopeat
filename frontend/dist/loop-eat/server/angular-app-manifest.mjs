
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
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HE6MDFZB.js"
    ],
    "route": "/utilisateurs/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/borrow/validation/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/borrow/select"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RPMYEPSB.js"
    ],
    "route": "/pro/give-back/validate"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RNP7MFPO.js"
    ],
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOEIZZLS.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOEIZZLS.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOEIZZLS.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOEIZZLS.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOEIZZLS.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion/mdp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOCIPNS2.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion-pro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOCIPNS2.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion-pro/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOCIPNS2.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion-pro/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOCIPNS2.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion-pro/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GOCIPNS2.js",
      "chunk-V4UVJ3OO.js"
    ],
    "route": "/connexion-pro/mdp"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 12145, hash: '3f73c1d8a9684d4ad22922c222a3c5c21bb49202c362539c97ac4558bc22ffeb', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1429, hash: '7571fce19742763602a3f479657b1ebc2c145a71e5bab429b7828b2fa8e7756e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69285, hash: '25e47f454b6466700df03ca647c3bb6e17e80ede3b85ac1dcdc241ddc86576a3', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
