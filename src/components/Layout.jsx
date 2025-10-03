// src/components/Layout.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import { TabBar } from "./TabBar";

const Layout = () => {
  const location = useLocation();

  // 탭바가 보여야 하는 경로들을 명시적으로 정의합니다.
  const visiblePaths = [
    "/main",
    "/search",
    "/chatls",
    "/notifications",
    "/mypage",
  ];

  // 현재 경로가 visiblePaths에 포함되어 있는지 확인합니다.
  // 이 방식이 '안 보이는 경로'를 나열하는 것보다 훨씬 직관적이고 효율적입니다.
  const isTabBarVisible = visiblePaths.includes(location.pathname);

  return <>{isTabBarVisible && <TabBar />}</>;
};

export default Layout;
