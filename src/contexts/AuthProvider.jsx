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
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setUser(null);
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
      try {
        const storedAccessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          setLoading(false);
          return;
        }

        if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
          setAccessToken(storedAccessToken);
          setUser({ username: jwtDecode(storedAccessToken).username });
        } else {
          const response = await api.post("/auth/reissue", {
            refresh_token: refreshToken,
          });
          const newAccessToken = response.headers["access"];
          if (!newAccessToken) throw new Error("재발급된 토큰 없음");

          localStorage.setItem("accessToken", newAccessToken);
          setAccessToken(newAccessToken);
          setUser({ username: jwtDecode(newAccessToken).username });
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
