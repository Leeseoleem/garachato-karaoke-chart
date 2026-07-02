import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'karachato',
  brand: {
    displayName: '가라챠토',
    primaryColor: '#7C5CBF', // brand-main (globals.css)
    icon: 'https://garachato-karaoke-chart.vercel.app/og-image.png', // TODO: 정사각 로고 URL로 교체 (임시 placeholder)
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
