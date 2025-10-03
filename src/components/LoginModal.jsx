// src/components/LoginModal.jsx

import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
`;

const AlertBox = styled.div`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.p`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  margin-bottom: 5px;
`;

const Message = styled.p`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const LoginButton = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.mainBlue};
  border-radius: 5px;
  border: none;
  color: white;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.grey};
  border-radius: 5px;
  border: none;
  color: white;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  cursor: pointer;
`;

const LoginModal = ({ visible, onClose, onLogin }) => {
  const handleLoginPress = () => {
    onLogin();
  };

  if (!visible) return null;

  return (
    <Overlay $visible={visible}>
      <AlertBox>
        <Title>로그인이 필요합니다</Title>
        <Message>로그인 하시겠습니까?</Message>
        <ButtonContainer>
          <LoginButton onClick={handleLoginPress}>로그인</LoginButton>
          <CancelButton onClick={onClose}>취소</CancelButton>
        </ButtonContainer>
      </AlertBox>
    </Overlay>
  );
};

export default LoginModal;
