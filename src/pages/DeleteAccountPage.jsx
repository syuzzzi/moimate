import React, { useState, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Button, AlertModal } from "../components";
import api from "../api/api";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 50px 30px;
  min-height: 80vh;
  position: relative;
`;
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
`;
const FooterContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50px;
  padding: 0 30px;
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
`;
const MessageText = styled.span`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.grey};
  font-size: 24px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bold};
  display: block;
`;
const HighlightText = styled.span`
  color: ${({ theme }) => theme.colors.mainBlue};
  font-family: inherit;
`;
const HighlightText2 = styled.span`
  color: ${({ theme }) => theme.colors.red};
  font-family: inherit;
`;

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 💡 중요: 로그인 시 refreshToken을 localStorage에 "refreshToken" 키로 저장했다고 가정합니다.
  const handleDeleteAccount = async () => {
    // 1차 확인 모달: 실제 삭제 함수(confirmDeletion) 연결
    setAlertMessage(
      "정말 회원 탈퇴를 진행하시겠습니까? \n 계정은 복구되지 않습니다"
    );
    setOnConfirmAction(() => confirmDeletion);
    setAlertVisible(true);
  };

  const confirmDeletion = async () => {
    setIsLoading(true);
    try {
      // 1. 필요한 토큰 정보 획득
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken"); // 💡 로컬 스토리지에서 Refresh Token 획득

      if (!accessToken || !refreshToken) {
        setAlertMessage("인증 정보가 부족합니다 \n 다시 로그인해주세요");
        setOnConfirmAction(() => () => navigate("/login"));
        setAlertVisible(true);
        setIsLoading(false);
        return;
      }

      // 2. 백엔드의 요구사항에 맞춰 토큰을 body에 담아 DELETE 요청
      await api.delete("/auth/delete", {
        headers: {
          access: accessToken,
          "Content-Type": "application/json",
        },
        // 백엔드가 요구하는 refresh_token을 body의 data 필드에 담아 전송
        data: {
          refresh_token: refreshToken,
        },
      });

      // 3. 성공 시 로컬 스토리지 데이터 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setAlertMessage("회원 탈퇴가 완료되었습니다");
      setOnConfirmAction(() => () => navigate("/")); // 홈으로 이동
      setAlertVisible(true);
    } catch (error) {
      console.error("❌ 탈퇴 실패:", error);
      const message = error.response?.data?.message || error.message;

      if (
        error.response?.status === 400 &&
        message.includes("refresh token removed")
      ) {
        // 백엔드에서 400을 반환하며 refreshToken 제거 성공 메시지를 보낼 경우 (RN 로직 기반)
        setAlertMessage("회원 탈퇴가 완료되었습니다.");
        setOnConfirmAction(() => () => navigate("/"));
      } else if (message.includes("토큰") || error.response?.status === 401) {
        setAlertMessage("인증에 실패했습니다. 다시 로그인 후 시도해주세요.");
        setOnConfirmAction(() => () => navigate("/login"));
      } else {
        setAlertMessage(`탈퇴 중 오류가 발생했습니다: ${message}`);
        setOnConfirmAction(null);
      }
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
    if (onConfirmAction) {
      onConfirmAction();
      setOnConfirmAction(null);
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <MessageText>
          <HighlightText>모아모아</HighlightText>와 함께한 시간들이
        </MessageText>
        <MessageText>아쉬우셨나요?</MessageText>
        <MessageText style={{ marginTop: 50 }}>탈퇴 버튼 선택 시,</MessageText>
        <MessageText>
          계정은 <HighlightText2>삭제</HighlightText2>되며
        </MessageText>
        <MessageText>복구되지 않습니다</MessageText>
      </ContentWrapper>
      <FooterContainer>
        <Button
          title={isLoading ? "처리 중..." : "탈퇴"}
          onClick={handleDeleteAccount}
          disabled={isLoading}
          style={{
            backgroundColor: theme.colors.red,
            width: "100%",
            maxWidth: 400,
            height: 50,
          }}
          textStyle={{ marginLeft: 0, fontSize: 18 }}
        />
      </FooterContainer>

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        onCancel={
          onConfirmAction ? handleAlertConfirm : () => setAlertVisible(false)
        }
      />
    </Container>
  );
};

export default DeleteAccountPage;
