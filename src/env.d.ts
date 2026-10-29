/// <reference types="vite/client" />

interface ImportMetaEnv {
  // "off" hides the URL source, for static hosting without the /api/fetch-text function (GitHub Pages).
  readonly VITE_URL_SOURCE?: 'on' | 'off';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
