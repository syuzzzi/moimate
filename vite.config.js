import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
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
      // ✅ WebSocket 프록시 (SockJS 포함)
      "/api/ws": {
        target:
          "http://ingress-ngi-ingress-ngin-f0790-110513573-2018eab2a2ae.kr.lb.naverncp.com",
        changeOrigin: true,
        secure: false,
        ws: true, // 💡 중요! 이게 있어야 웹소켓 프록시가 작동
      },
    },
  },
  // 빌드 설정 추가
  build: {
    // 💡 큰 청크 파일에 대한 경고 제한을 1600kB로 상향 조정
    chunkSizeWarningLimit: 1600,
    // 💡 매니페스트 파일 생성 활성화 (백엔드 통합에 유용)
    manifest: true,
    rollupOptions: {
      input: "src/main.jsx",
    },
  },
});
