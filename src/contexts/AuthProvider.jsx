// src/contexts/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/utils";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (newAccessToken, newRefreshToken, userProfile) => {
    try {
      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        setAccessToken(newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      if (userProfile) setUser(userProfile);
      else if (newAccessToken)
        setUser({ username: jwtDecode(newAccessToken).username });

      console.log("✅ 로그인 완료 (웹)");
    } catch (error) {
      console.error("❌ 로그인 처리 실패:", error);
    }
  };

  const signout = async () => {
    try {
      const storedAccessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (storedAccessToken && refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
        console.log("✅ 서버 로그아웃 완료");
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setUser(null);
      console.log("✅ 클라이언트 로그아웃 완료");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      console.log("🔄 웹 세션 복원 시도 중...");
      try {
        const storedAccessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.log("리프레시 토큰 없음 → 로그인 필요");
          setLoading(false);
          return;
        }

        if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
          setAccessToken(storedAccessToken);
          setUser({ username: jwtDecode(storedAccessToken).username });
          console.log("✅ access token 복원 성공");
        } else {
          const response = await api.post("/auth/reissue", {
            refresh_token: refreshToken,
          });
          const newAccessToken = response.headers["access"];
          if (!newAccessToken) throw new Error("재발급된 토큰 없음");

          localStorage.setItem("accessToken", newAccessToken);
          setAccessToken(newAccessToken);
          setUser({ username: jwtDecode(newAccessToken).username });
          console.log("✅ refresh token으로 새 access 발급 성공");
        }
      } catch (error) {
        console.error("❌ 세션 복원 실패:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        login,
        signout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
