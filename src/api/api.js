import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 백엔드 서버 주소
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
