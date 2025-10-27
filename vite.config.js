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
      "/naver-token": {
        target: "https://nid.naver.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/naver-token/, ""),
      },
      "/naver-api": {
        target: "https://openapi.naver.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/naver-api/, ""),
      },
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
});
