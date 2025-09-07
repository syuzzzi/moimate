import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, MessageSquare, Bell, User } from "react-feather";

import api from "../api/api";
import theme from "../theme.js";

const TabBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top: 1px solid ${({ theme }) => theme.colors.lightGrey};
`;

const TabItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${({ active, theme }) =>
    active ? theme.colors.mainBlue : theme.colors.grey};
  font-size: 12px;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const UnreadBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: red;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
`;

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const checkLogin = useCallback(
    async (screenPath) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // 실제 앱에서는 로그인 모달을 띄우거나 로그인 페이지로 리디렉션
        alert("로그인이 필요합니다."); // 임시 알림창
        return false;
      }
      navigate(screenPath);
      return true;
    },
    [navigate]
  );

  const fetchUnreadNotifications = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await api.get("/notifications", {
        headers: { access: token },
      });
      const list = Array.isArray(data?.data) ? data.data : [];
      const count = list.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch (e) {
      console.log("🔔 알림 가져오기 실패", e);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [location.pathname]);

  return (
    <TabBarContainer>
      <TabItem to="/main" active={location.pathname === "/" || undefined}>
        <Home
          size={25}
          color={
            location.pathname === "/main"
              ? theme.colors.mainBlue
              : theme.colors.grey
          }
        />
      </TabItem>
      <TabItem to="/search" active={location.pathname === "/" || undefined}>
        <Search
          size={25}
          color={
            location.pathname === "/search"
              ? theme.colors.mainBlue
              : theme.colors.grey
          }
        />
      </TabItem>
      <TabItem
        to="/chatls"
        /*to="#"
         onClick={() => navigate("/chatls")} */
        active={location.pathname === "/" || undefined}
      >
        <MessageSquare
          size={25}
          color={
            location.pathname === "/chatls"
              ? theme.colors.mainBlue
              : theme.colors.grey
          }
        />
      </TabItem>
      <TabItem
        to="/notifications"
        /*to="#"
        onClick={() => navigate("/notifications")}  */
        active={location.pathname === "/" || undefined}
      >
        <div style={{ position: "relative" }}>
          <Bell
            size={25}
            color={
              location.pathname === "/notifications"
                ? theme.colors.mainBlue
                : theme.colors.grey
            }
          />
          {unreadCount > 0 && (
            <UnreadBadge>{unreadCount > 99 ? "99+" : unreadCount}</UnreadBadge>
          )}
        </div>
      </TabItem>
      <TabItem
        to="/mypage"
        onClick={() => navigate("/mypage")}
        active={location.pathname === "/mypage" || undefined}
      >
        <User
          size={25}
          color={
            location.pathname === "/mypage"
              ? theme.colors.mainBlue
              : theme.colors.grey
          }
        />
      </TabItem>
    </TabBarContainer>
  );
};
