// Vite에서 제공하는 환경 변수를 사용합니다.
const isDevelopment = import.meta.env.DEV;

// 🚨 여기에 실제 운영 서버 주소를 입력해주세요.
const PROD_ROOT_URL = "https://api.moamoa.com";

// 개발 환경에서는 localhost 주소를 사용합니다.
const DEV_ROOT_URL = "http://localhost:8080";

// 개발/운영 환경에 따라 올바른 URL을 선택합니다.
const ROOT_URL = isDevelopment ? DEV_ROOT_URL : PROD_ROOT_URL;

// API와 WebSocket URL을 내보냅니다.
export const API_BASE_URL = `${ROOT_URL}/api`;
export const WEBSOCKET_URL = `${ROOT_URL}/ws`;
