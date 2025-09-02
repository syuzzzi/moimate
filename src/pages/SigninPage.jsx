import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { Button, AlertModal } from "../components";
import styled, { ThemeContext } from "styled-components";
import Logo from "../../assets/logo.svg?react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
//import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 30px;
  min-height: 100vh;
`;

const DividerContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  width: 100px;
  background-color: ${({ theme }) => theme.colors.lightGrey};
`;

const DividerText = styled.span`
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.grey};
  margin: 0px 20px;
`;

const Signin = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const KAKAO_REST_API_KEY = import.meta.env.VITE_REST_API_KEY;

  const hasFetchedToken = useRef(false); // 토큰을 이미 받아왔는지 추적

  //const { setUser, setAccessToken } = useAuth();

  // ✅ 토큰을 받아오는 함수 (useEffect에서 호출)
  const getKakaoToken = useCallback(
    async (code) => {
      try {
        setLoading(true);

        const res = await axios.post(
          `https://kauth.kakao.com/oauth/token`,
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: KAKAO_REST_API_KEY,
            redirect_uri: KAKAO_REDIRECT_URI,
            code,
          }),
          {
            headers: {
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        const token = res.data.access_token;
        console.log("받은 액세스 토큰:", token);

        // URL에서 code 값 제거
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.toString());

        // ✅ 카카오 사용자 정보 가져오기
        const kakaoUserInfoRes = await axios.get(
          "https://kapi.kakao.com/v2/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { kakao_account } = kakaoUserInfoRes.data;

        // ✅ 백엔드에 전달할 데이터 구성
        const userData = {
          email: kakao_account?.email,
          name: kakao_account?.profile?.nickname,
          gender: kakao_account?.gender?.toUpperCase(),
          id: kakaoUserInfoRes.data.id,
          phonenumber: kakao_account?.phone_number,
        };

        // ✅ 백엔드에 사용자 정보 전달
        const response = await api.post("/auth/signup/kakao", userData);

        const accessToken = response.headers.access;
        const backendRefreshToken = response.data.refresh_token;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          // setAccessToken(accessToken);
        }

        if (backendRefreshToken) {
          localStorage.setItem("refreshToken", backendRefreshToken);
        }

        // setUser(response.data);
        navigate("/hing");
      } catch (error) {
        console.error("카카오 토큰/정보 발급 실패:", error);
        if (error?.response?.status === 409) {
          setModalMessage(
            "이미 가입된 이메일입니다.\n기존 계정으로 로그인해주세요."
          );
        } else {
          setModalMessage("카카오 로그인에 실패했습니다.");
        }
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    },
    [
      KAKAO_REST_API_KEY, // ✅ 누락된 의존성을 추가했습니다.
      KAKAO_REDIRECT_URI, // ✅ 누락된 의존성을 추가했습니다.
      navigate, // navigate도 의존성 배열에 포함시킵니다.
      setLoading, // ✅ useState setter 함수도 포함시킵니다.
      setModalMessage, // ✅ useState setter 함수도 포함시킵니다.
      setModalVisible, // ✅ useState setter 함수도 포함시킵니다.
    ]
  );

  // ✅ useEffect 훅을 사용하여 페이지 로드 시 URL을 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // ✅ code가 있고, 아직 토큰을 가져오지 않았다면
    if (code && !hasFetchedToken.current) {
      hasFetchedToken.current = true; // ✅ 플래그를 true로 변경
      getKakaoToken(code);
    }
  }, [getKakaoToken]);

  // ✅ 로그인 버튼을 클릭했을 때 실행되는 함수
  const signinWithKakao = useCallback(() => {
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

    window.location.href = kakaoURL;
  }, [KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI]);

  const navigateToEmailSignup = () => {
    navigate("/email-signup"); // 이메일 회원가입 페이지 경로
  };

  return (
    <Container>
      {loading && (
        <div style={{ position: "absolute", top: "50%", zIndex: 2 }}>
          로딩 중...
        </div>
      )}

      <Logo style={{ marginBottom: 50 }} />

      <DividerContainer>
        <DividerLine />
        <DividerText>로그인/회원가입</DividerText>
        <DividerLine />
      </DividerContainer>

      <Button
        title="카카오로 시작하기"
        onClick={signinWithKakao}
        icon="../../assets/kakao.png" // 웹용 이미지 경로
        style={{
          width: "100%",
          backgroundColor: "#FFDE00",
          marginTop: 0,
          marginBottom: 30,
        }}
        textStyle={{
          color: "#3B1E1E",
          fontSize: 16,
          fontFamily: theme.fonts.bold,
        }}
      />

      <Button
        title="네이버로 시작하기"
        //onClick={signinWithNaver}
        icon="../../assets/naver.png" // 웹용 이미지 경로
        style={{
          width: "100%",
          backgroundColor: "#00C73C",
          marginTop: 0,
          marginBottom: 30,
        }}
        textStyle={{
          color: "#ffffff",
          fontSize: 16,
          fontFamily: theme.fonts.bold,
        }}
      />

      <Button
        title="이메일로 시작하기"
        onClick={navigateToEmailSignup}
        icon="../../assets/mail.png" // 웹용 이미지 경로
        style={{
          width: "100%",
          backgroundColor: "#E3F0FF",
          marginTop: 0,
          marginBottom: 60,
        }}
        textStyle={{
          color: "#3F9AFE",
          fontSize: 16,
          fontFamily: theme.fonts.bold,
        }}
      />

      <AlertModal
        $visible={modalVisible}
        message={modalMessage}
        onConfirm={() => setModalVisible(false)}
      />
    </Container>
  );
};

export default Signin;
