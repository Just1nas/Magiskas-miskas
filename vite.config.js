import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
const logo = ['svg', 'png', 'webp'].map(ext => `brand/logo.${ext}`).find(path => existsSync(`public/${path}`));
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { rollupOptions: { input: { site: 'index.html', english: 'en/index.html', admin: 'gabija/index.html', miskografija: 'miskografijos-skliautai/index.html', tickets: 'bilietai/index.html', guide: 'gidas/index.html' } } },
  define: { __BRAND__: JSON.stringify({
    logo: logo ? `/${logo}` : null,
    magical: existsSync('public/fonts/Magical-Regular.woff2'),
    manrope: existsSync('public/fonts/Manrope-VariableFont_wght.woff2'),
  }) },
});
