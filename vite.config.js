import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  // Vercel 환경에서 정적 파일 경로 오류 (404)를 해결하기 위해 base 경로를 루트(/)로 강제 지정합니다.
  base: "/",

  plugins: [react(), svgr()],
  define: {
    global: "window",
  },
  server: {
    proxy: {
      "/api": {
        target:
          "http://ingress-ngi-ingress-ngin-f0790-110513573-2018eab2a2ae.kr.lb.naverncp.com",
        changeOrigin: true,
        secure: false,
      },
      // WebSocket 프록시 설정
      "/api/ws": {
        target:
          "http://ingress-ngi-ingress-ngin-f0790-110513573-2018eab2a2ae.kr.lb.naverncp.com",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  // 빌드 설정 수정
  build: {
    chunkSizeWarningLimit: 1600,
    manifest: true,
    rollupOptions: {
      // 🚨 'src/main.jsx' 대신 'index.html'을 Rollup의 주 입력점으로 사용하도록 수정
      input: "index.html",
    },
  },
});
