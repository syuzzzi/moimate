// Vite에서 제공하는 환경 변수를 사용합니다.
const isDevelopment = import.meta.env.DEV;

// 🚨 여기에 실제 운영 서버 주소를 입력해주세요.
const PROD_ROOT_URL = "https://moimate.vercel.app";

// 개발 환경에서는 localhost 주소를 사용합니다.

const DEV_ROOT_URL = "http://localhost:5173";

// **ROOT_URL 변수 정의를 복구합니다.**
const ROOT_URL = isDevelopment ? DEV_ROOT_URL : PROD_ROOT_URL;

// --- 웹소켓 프록시를 위한 별도 설정 ---

// 개발 환경에서는 localhost 주소를 사용해야 Vite 프록시가 작동합니다.
// (참고: 웹소켓 프로토콜을 명확히 하기 위해 "ws://"로 바꾸는 것을 고려해보세요)
const DEV_WS_BASE = "http://localhost:5173"; // 프록시를 위한 로컬 기본 주소

// API와 WebSocket URL을 내보냅니다.
export const API_BASE_URL = `${ROOT_URL}/api`; // ROOT_URL을 사용하여 API 주소 생성

// 웹소켓 URL은 개발 환경에서 프록시를 타도록 설정
export const WEBSOCKET_URL = isDevelopment ? `/api/ws` : `${ROOT_URL}/api/ws`; // 운영 환경은 실제 주소 사용
