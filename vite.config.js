import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
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
    },
  },
});
