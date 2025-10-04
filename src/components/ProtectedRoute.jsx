// src/components/ProtectedRoute.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import LoginModal from "./LoginModal";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // ✅ 로딩이 끝나고, 로그인이 되어있지 않을 때만 모달을 띄웁니다.
    if (!loading && !isAuthenticated) {
      setModalVisible(true);
    }
  }, [isAuthenticated, loading]);

  const handleLoginPress = () => {
    setModalVisible(false); // 모달 닫기
    navigate("/signin", { replace: true }); // ✅ 로그인 페이지로 이동
  };

  const handleCloseModal = () => {
    setModalVisible(false); // 모달 닫기
    navigate("/main"); // ✅ 이전 페이지로 돌아가기
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // ✅ 로그인 상태일 경우 하위 컴포넌트를 렌더링합니다.
  if (isAuthenticated) {
    return children;
  }

  // ✅ 로그인 상태가 아닐 경우, LoginModal을 렌더링합니다.
  return (
    <LoginModal
      visible={modalVisible}
      onClose={handleCloseModal}
      onLogin={handleLoginPress}
    />
  );
};

export default ProtectedRoute;
