// src/screens/SigninWithEmail.jsx
import React, { useState, useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Input, Button, ErrorMessage } from "../components";
import LostPw from "../components/LostPw";
import Logo from "../../assets/logo.svg?react";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth"; // AuthContext 복원
import { ChevronLeft } from "react-feather";

// 이메일 유효성 검사
const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const removeWhitespace = (text) => text.replace(/\s/g, "");

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

const BackButton = styled.button`
  position: absolute;
  top: 30px; /* 상단에서 30px만큼 떨어지도록 조정 */
  left: 10px; /* 화면 왼쪽에서 10px만큼 떨어지도록 조정 */
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px; /* 클릭 영역 확보 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;
const RightAlignedWrapper = styled.div`
  width: 100%;
  text-align: right;
  margin-bottom: 20px;
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

  const { login } = useAuth(); // AuthContext에서 login 함수 가져오기

  useEffect(() => {
    setDisabled(!(email && password && !errorMessage));
  }, [email, password, errorMessage]);

  const _handleEmailChange = (e) => {
    let changeEmail = removeWhitespace(e.target.value).replace(
      /[ㄱ-ㅎㅏ-ㅣ가-힣]/g,
      ""
    );
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
        { headers: { "Content-Type": "application/json" } }
      );

      const accessToken = response.headers.access;
      const refreshToken = response.data.refresh_token;
      const userData = response.data.data; // 백엔드에서 반환하는 유저 정보

      if (!accessToken || !refreshToken) {
        setErrorMessage("로그인 정보가 올바르지 않습니다.");
        return;
      }

      // AuthContext 로그인 상태 업데이트
      login(accessToken, refreshToken, userData || {});

      console.log("로그인 성공", userData);
      navigate("/main", { replace: true });
    } catch (error) {
      if (error.response) {
        console.error("서버 응답:", error.response);
        setErrorMessage(error.response.data.message || "로그인 실패");
      } else if (error.request) {
        console.error("네트워크 오류:", error.request);
        setErrorMessage("서버와 연결할 수 없습니다.");
      } else {
        console.error("오류:", error.message);
        setErrorMessage("예기치 못한 오류가 발생했습니다.");
      }
    }
  };

  return (
    <PageWrapper>
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
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
          isPassword
        />
        <RightAlignedWrapper>
          <LostPw
            title="비밀번호를 잊으셨나요?"
            onClick={() => navigate("/findpw")}
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
          style={{ height: 25, marginTop: 0, backgroundColor: "transparent" }}
          textStyle={{ color: theme.colors.grey, fontSize: 15 }}
        />
        <Button
          title="이메일로 회원가입"
          onClick={() => navigate("/signup")}
          style={{ height: 25, marginTop: 0, backgroundColor: "transparent" }}
          textStyle={{ color: theme.colors.black, fontSize: 16 }}
        />
      </FooterContainer>
    </PageWrapper>
  );
};

export default SigninWithEmail;
