// src/pages/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import theme from "../theme";
import SignupDonePage from "./SignupDonePage";
import Hing from "./Hing";
import SignupPage from "./SignupPage";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/done" element={<SignupDonePage />} />
        <Route path="/hing" element={<Hing />} />
        <Route path="/" element={<SignupPage />} />
        {/* 다른 라우트들을 여기에 추가하세요 */}
      </Routes>
    </ThemeProvider>
  );
};

export default App;
