// src/api/api.js 파일 수정
import axios from "axios";

const api = axios.create({
  // Vercel에서 설정한 'rewrites' 규칙에 맞춰 '/api'를 baseURL로 사용
  baseURL: "/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
