import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg?react";
import { Button } from "../components";

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

const Text = styled.h1`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;

const FooterContainer = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 60px); // 좌우 패딩 고려
`;

const Start = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate("/main");
  };

  return (
    <Container>
      <Logo style={{ marginBottom: 50 }} />
      <Text>moimate에 오신 것을 환영합니다!</Text>
      <Text>
        모바일 화면을 기준으로 제작 되었습니다 <br />
        pc - 크롬 브라우저에서 진행해주세요
      </Text>
      <Text>
        개발자 도구 - 기기 툴바 전환 - <br />
        iPhone 12 pro로 설정 후<br />
        확인을 눌러주세요!
      </Text>
      <FooterContainer>
        <Button title="확인" onClick={handleConfirm} />
      </FooterContainer>
    </Container>
  );
};

export default Start;
