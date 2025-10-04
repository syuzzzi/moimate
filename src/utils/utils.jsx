import { jwtDecode } from "jwt-decode";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const removeWhitespace = (text) => {
  const regex = /\s/g;
  return text.replace(regex, "");
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  const [hour, minute] = timeString.split(":");
  return `${hour} : ${minute}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.replace(/-/g, " / ");
};

// 토큰 만료 여부 확인 함수
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // 초 단위
    return decoded.exp < now;
  } catch (e) {
    return true; // 디코딩 실패 → 만료로 간주
  }
};
