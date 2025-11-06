
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
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
    ],
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EVTCQEJB.js"
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
      "chunk-OG3JJTV4.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OG3JJTV4.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OG3JJTV4.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OG3JJTV4.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OG3JJTV4.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion/mdp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GLV3R75.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion-pro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GLV3R75.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion-pro/mot-de-passe"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GLV3R75.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion-pro/verification"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GLV3R75.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion-pro/nom"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-4GLV3R75.js",
      "chunk-LGBLZO7F.js"
    ],
    "route": "/connexion-pro/mdp"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 12145, hash: '62ae06fc6449c6469e0baef86d2abc219eb26f8157abaa1030729b76f4a4b24d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1429, hash: '143c33a03ceb849168d64f45e997125460d931b233bf03b7567d72adf0aaf9c7', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69285, hash: '262db0024094f61b04963ee679773148ce9d47f2d824740fd2113b27625411d2', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
