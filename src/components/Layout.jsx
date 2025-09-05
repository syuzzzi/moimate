// src/components/Layout.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import { TabBar } from "./TabBar";

const Layout = () => {
  const location = useLocation();

  // Define the paths where you do NOT want to show the TabBar
  const hiddenPaths = [
    "/",
    "/signup",
    "/signinwithemail",
    "/findpw",
    "/done",
    "/hing",
  ];

  const isTabBarVisible = !hiddenPaths.includes(location.pathname);

  return <>{isTabBarVisible && <TabBar />}</>;
};

export default Layout;
