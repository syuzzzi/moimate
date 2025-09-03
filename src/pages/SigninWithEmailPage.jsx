import React, { useState, useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Input, Button, ErrorMessage } from "../components";
import LostPw from "../components/LostPw";
import Logo from "../../assets/logo.svg?react";
import api from "../api/api";
// import { useAuth } from "../contexts/AuthContext";

// 웹에서 필요한 유틸리티 함수
const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
const removeWhitespace = (text) => {
  return text.replace(/\s/g, "");
};

// 웹용 레이아웃 컨테이너
const PageWrapper = styled.div`
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 30px;
  min-height: 100vh;
`;
const RightAlignedWrapper = styled.div`
  width: 100%;
  text-align: right;
  margin-bottom: 20px;
  align-items: flex-end;
`;

const FooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: 50px;
  align-items: center;
  width: 100%;
  text-align: center;
`;

const SigninWithEmail = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [disabled, setDisabled] = useState(true);

  // const { setUser, setAccessToken } = useAuth(); // AuthContext 주석 처리

  useEffect(() => {
    setDisabled(!(email && password && !errorMessage));
  }, [email, password, errorMessage]);

  const _handleEmailChange = (e) => {
    let changeEmail = removeWhitespace(e.target.value);
    changeEmail = changeEmail.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setEmail(changeEmail);
    setErrorMessage(
      validateEmail(changeEmail) ? "" : "이메일을 올바르게 입력해주세요"
    );
  };

  const _handlePasswordChange = (e) => {
    const changePassword = removeWhitespace(e.target.value);
    setPassword(changePassword);
    setErrorMessage(changePassword !== "" ? "" : "비밀번호를 입력해주세요");
  };

  const _handleSigninBtnPress = async () => {
    console.log("로그인 버튼 누름");
    console.log(
      "보내는 데이터:",
      JSON.stringify({ username: email, password })
    );

    if (!validateEmail(email)) {
      setErrorMessage("이메일을 올바르게 입력해주세요");
      return;
    }
    if (password === "") {
      setErrorMessage("비밀번호를 입력해주세요");
      return;
    }
    setErrorMessage("");

    try {
      const response = await api.post(
        "/auth/login",
        { username: email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("로그인 성공");

      const accessToken = response.headers.access;
      const refreshToken = response.data.refresh_token;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        // setAccessToken(accessToken); // AuthContext 주석 처리
        console.log("저장된 액세스 토큰: ", accessToken);
      } else {
        console.log("access가 존재하지 않습니다");
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        console.log("저장된 리프레쉬 토큰: ", refreshToken);
      } else {
        console.error("refreshToken이 존재하지 않습니다");
      }

      // setUser(response.data); // AuthContext 주석 처리
      navigate("/hing", { replace: true });
    } catch (error) {
      if (error.response) {
        console.error("서버 응답 상태 코드:", error.response.status);
        console.error("서버 응답 데이터:", error.response.data);
        setErrorMessage(
          error.response.data.message || "로그인에 실패했습니다."
        );
      } else if (error.request) {
        console.error("네트워크 오류:", error.request);
        setErrorMessage("서버와 연결할 수 없습니다.");
      } else {
        console.error("오류 발생:", error.message);
        setErrorMessage("예기치 못한 오류가 발생했습니다.");
      }
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Logo style={{ marginBottom: 50 }} />
        <Input
          label="이메일"
          placeholder="example@email.com"
          value={email}
          onChange={_handleEmailChange}
          style={{ marginBottom: 20 }}
        />
        <Input
          label="비밀번호"
          value={password}
          onChange={_handlePasswordChange}
          isPassword={true}
        />
        <RightAlignedWrapper style={{ alignContent: "flex-end" }}>
          <LostPw
            title="비밀번호를 잊으셨나요?"
            onClick={() => navigate("/findpw")}
            containerStyle={{ width: "100%", textAlign: "right" }}
          />
        </RightAlignedWrapper>

        <Button
          title="로그인"
          onClick={_handleSigninBtnPress}
          disabled={disabled}
          style={{ width: "100%", marginTop: 30 }}
        />
        <ErrorMessage message={errorMessage} style={{ marginTop: 10 }} />
      </Container>
      <FooterContainer>
        <Button
          title="아직 회원이 아니시라면?"
          onClick={() => navigate("/signup")}
          style={{
            height: 25,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: "transparent",
          }}
          textStyle={{
            color: theme.colors.grey,
            fontSize: 15,
            fontFamily: theme.fonts.regular,
            marginLeft: 0,
          }}
        />
        <Button
          title="이메일로 회원가입"
          onClick={() => navigate("/signup")}
          style={{
            height: 25,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: "transparent",
          }}
          textStyle={{
            color: theme.colors.black,
            fontSize: 16,
            fontFamily: theme.fonts.bold,
            marginLeft: 0,
          }}
        />
      </FooterContainer>
    </PageWrapper>
  );
};

export default SigninWithEmail;
