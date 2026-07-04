import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'karachato',
  brand: {
    displayName: '가라챠토',
    primaryColor: '#7C5CBF', // brand-main (globals.css)
    icon: 'https://garachato-karaoke-chart.vercel.app/karachato_logo.png', // 정사각 불투명 로고 (karachato/public/)
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  // 다크 컨셉: 호스트 네비바를 다크로 (미적용 시 흰 네비바가 #121216과 충돌)
  navigationBar: {
    theme: 'dark',
    withBackButton: true,
    withTitle: true,
  },
  // 비게임(partner) + 앱처럼 동작: 당겨서새로고침/오버스크롤 off
  webViewProps: {
    type: 'partner',
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
  },
  permissions: [],
  outdir: 'dist',
});
