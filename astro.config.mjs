import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bangudevclub.github.io',
  base: '/atlaseleitoral',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
