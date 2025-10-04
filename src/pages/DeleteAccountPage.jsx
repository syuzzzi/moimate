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

  // 💡 1차 확인 모달을 띄우는 함수 (탈퇴 실행 함수를 onConfirmAction에 저장)
  const handleDeleteAccount = async () => {
    setAlertMessage(
      "정말 회원 탈퇴를 진행하시겠습니까? \n 계정은 복구되지 않습니다"
    );
    // onConfirmAction에 실제 삭제 함수를 저장
    setOnConfirmAction(() => confirmDeletion);
    setAlertVisible(true);
  };

  const confirmDeletion = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        setAlertMessage("인증 정보가 부족합니다 \n 다시 로그인해주세요");
        setOnConfirmAction(() => () => navigate("/login"));
        setAlertVisible(true);
        setIsLoading(false);
        return;
      }

      // 백엔드의 요구사항에 맞춰 토큰을 body에 담아 DELETE 요청
      await api.delete("/auth/delete", {
        headers: {
          access: accessToken,
          "Content-Type": "application/json",
        },
        data: {
          refresh_token: refreshToken,
        },
      });

      // 성공 시 로컬 스토리지 데이터 삭제
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
        setAlertMessage("회원 탈퇴가 완료되었습니다");
        setOnConfirmAction(() => () => navigate("/"));
      } else if (message.includes("토큰") || error.response?.status === 401) {
        setAlertMessage("인증에 실패했습니다\n다시 로그인 후 시도해주세요");
        setOnConfirmAction(() => () => navigate("/login"));
      } else {
        setAlertMessage(`탈퇴 중 오류가 발생했습니다 \n ${message}`);
        setOnConfirmAction(null);
      }
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 긍정적인 응답 (확인)을 처리하는 함수
  const handleAlertConfirm = () => {
    setAlertVisible(false);
    if (onConfirmAction) {
      onConfirmAction(); // 저장된 탈퇴 함수(confirmDeletion) 실행
      setOnConfirmAction(null);
    }
  };

  // 💡 부정적인 응답 (취소)를 처리하는 함수 (버그 수정의 핵심)
  const handleAlertCancel = () => {
    setAlertVisible(false);
    // ❌ 탈퇴 함수를 실행하지 않고, 저장된 액션만 지워서 탈퇴를 방지
    setOnConfirmAction(null);
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
        onConfirm={handleAlertConfirm} // 확인 버튼은 액션 실행 (긍정 경로)
        // 💡 수정 완료: 취소 버튼은 액션 저장 여부에 따라 분기
        onCancel={onConfirmAction ? handleAlertCancel : handleAlertConfirm} // 취소 버튼은 액션 실행 없이 닫기 (부정 경로)
      />
    </Container>
  );
};

export default DeleteAccountPage;
