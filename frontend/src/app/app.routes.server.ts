import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'utilisateurs',
    renderMode: RenderMode.Client,
  },
  {
    path: 'utilisateurs/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pro',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pro/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'connexion',
    renderMode: RenderMode.Client,
  },
  {
    path: 'connexion/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'connexion-pro/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
