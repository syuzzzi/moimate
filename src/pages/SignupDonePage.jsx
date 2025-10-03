import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { useNavigate } from "react-router-dom";
import theme from "../theme.js";
import Button from "../components/Button.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; // 화면 전체 높이
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 30px;
  position: relative; // FooterContainer를 위해
`;

const FooterContainer = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 60px); // 좌우 패딩 고려
`;

const MessageText = styled.p`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.grey};
  font-size: 24px;
  text-align: center;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const HighlightText = styled.span`
  color: ${({ theme }) => theme.colors.mainBlue};
`;

const SignupDonePage = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate("/signinwithemail");
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <div>
          <MessageText>회원가입이 완료되었습니다!</MessageText>
          <MessageText>
            <HighlightText>모아모아</HighlightText>와 함께
          </MessageText>
          <MessageText>즐거운 모임을 즐겨보아요</MessageText>
        </div>

        <FooterContainer>
          <Button title="확인" onClick={handleConfirm} />
        </FooterContainer>
      </Container>
    </ThemeProvider>
  );
};

export default SignupDonePage;
