import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const BASE = import.meta.env.VITE_API_BASE_URL;

export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    global: "window",
  },
  server: {
    proxy: {
      "/api": {
        target: BASE,
        changeOrigin: true,
        secure: false,
      },
      // ✅ WebSocket 프록시 (SockJS 포함)
      "/api/ws": {
        target: BASE,
        changeOrigin: true,
        secure: false,
        ws: true, // 💡 중요! 이게 있어야 웹소켓 프록시가 작동
      },
    },
  },
});
