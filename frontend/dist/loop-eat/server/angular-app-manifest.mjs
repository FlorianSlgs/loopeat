
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
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/historique"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/boites"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/parametres"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/recharge"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
    ],
    "route": "/utilisateurs/annule"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IN7TJZ6U.js"
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
    'index.csr.html': {size: 12145, hash: '06d98673c4144dd7c7d6bdc0363c07789750b837967bbb623e0465a7abd2c590', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1429, hash: '2927f7aae1a0f02979cdad4d8f5467f7254ac5226acff605dc930eb59566eb98', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 69285, hash: 'd60245af11b6570d886a57e945ac9c5dc633f3c0adbe6d4150e0cf6b2c629bc7', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIQTABRK.css': {size: 61112, hash: 'FU56VGLlp+0', text: () => import('./assets-chunks/styles-YIQTABRK_css.mjs').then(m => m.default)}
  },
};
