// src/pages/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupDonePage from "./SignupDonePage";
import Hing from "./Hing";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignupDonePage />} />
      <Route path="/hing" element={<Hing />} />
      {/* HingPage 라우트 추가 */}
      {/* 다른 라우트들을 여기에 추가하세요 */}
    </Routes>
  );
};

export default App;
