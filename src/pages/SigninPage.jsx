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
import { v4 as uuidv4 } from "uuid"; // uuid 라이브러리 추가
import Spinner from "../components/Spinner";

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

  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
  const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;

  const hasFetchedToken = useRef(false);

  //const { setUser, setAccessToken } = useAuth();

  const getKakaoToken = useCallback(
    async (code) => {
      try {
        setLoading(true);

        const res = await axios.post(
          `https://kauth.kakao.com/oauth/token`,
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: KAKAO_REST_API_KEY,
            redirect_uri: REDIRECT_URI,
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

        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.toString());

        const kakaoUserInfoRes = await axios.get(
          "https://kapi.kakao.com/v2/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { kakao_account } = kakaoUserInfoRes.data;

        const userData = {
          email: kakao_account?.email,
          name: kakao_account?.profile?.nickname,
          gender: kakao_account?.gender?.toUpperCase(),
          id: kakaoUserInfoRes.data.id,
          phonenumber: kakao_account?.phone_number,
        };

        const response = await api.post("/auth/signup/kakao", userData);

        const accessToken = response.headers.access;
        const backendRefreshToken = response.data.refresh_token;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }

        if (backendRefreshToken) {
          localStorage.setItem("refreshToken", backendRefreshToken);
        }

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
      KAKAO_REST_API_KEY,
      REDIRECT_URI,
      navigate,
      setLoading,
      setModalMessage,
      setModalVisible,
    ]
  );

  const getNaverToken = useCallback(
    async (code, state) => {
      try {
        setLoading(true);

        // Vite dev server 프록시 경유 (토큰 발급)
        const res = await axios.post(
          `/naver-token/oauth2.0/token`,
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: NAVER_CLIENT_ID,
            client_secret: import.meta.env.VITE_NAVER_CLIENT_SECRET,
            code,
            state,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        const accessToken = res.data.access_token;
        console.log("네이버 액세스 토큰:", accessToken);

        // 프로필 API는 openapi.naver.com 경유
        const naverUserInfoRes = await axios.get("/naver-api/v1/nid/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // 여기 반드시 있어야 함
          },
        });

        const { response } = naverUserInfoRes.data;

        const userData = {
          email: response.email,
          name: response.name,
          gender: response.gender,
          id: response.id,
          phonenumber: response.mobile_e164,
        };

        const responseFromBackend = await api.post(
          "/auth/signup/naver",
          userData
        );

        const backendAccessToken = responseFromBackend.headers.access;
        const backendRefreshToken = responseFromBackend.data.refresh_token;

        if (backendAccessToken) {
          localStorage.setItem("accessToken", backendAccessToken);
        }
        if (backendRefreshToken) {
          localStorage.setItem("refreshToken", backendRefreshToken);
        }

        navigate("/hing");
      } catch (error) {
        console.error("네이버 로그인 실패:", error);
        if (error?.response?.status === 409) {
          setModalMessage(
            "이미 가입된 이메일입니다.\n기존 계정으로 로그인해주세요."
          );
        } else {
          setModalMessage("네이버 로그인에 실패했습니다.");
        }
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    },
    [NAVER_CLIENT_ID, navigate, setLoading, setModalMessage, setModalVisible]
  );

  const signinWithKakao = useCallback(() => {
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    window.location.href = kakaoURL;
  }, [KAKAO_REST_API_KEY, REDIRECT_URI]);

  const signinWithNaver = useCallback(() => {
    const state = uuidv4();
    localStorage.setItem("naver_state", state); // CSRF 공격 방지를 위해 state를 localStorage에 저장
    const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${state}&redirect_uri=${REDIRECT_URI}`;

    window.location.href = naverURL;
  }, [NAVER_CLIENT_ID, REDIRECT_URI]);

  const navigateToEmailSignup = () => {
    navigate("/signinwithemail");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const storedState = localStorage.getItem("naver_state");

    if (code && !hasFetchedToken.current) {
      hasFetchedToken.current = true;

      if (state && storedState && state === storedState) {
        // 네이버 로그인
        getNaverToken(code, state);
        localStorage.removeItem("naver_state");
      } else {
        // 카카오 로그인
        getKakaoToken(code);
      }
    }
  }, [getKakaoToken, getNaverToken]);

  return (
    <Container>
      {loading && <Spinner fullscreen size="30px" thickness="4px" />}

      <Logo style={{ marginBottom: 50 }} />

      <DividerContainer>
        <DividerLine />
        <DividerText>로그인/회원가입</DividerText>
        <DividerLine />
      </DividerContainer>

      <Button
        title="카카오로 시작하기"
        onClick={signinWithKakao}
        icon="../../assets/kakao.png"
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
        onClick={signinWithNaver}
        icon="../../assets/naver.png"
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
        icon="../../assets/mail.png"
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
        visible={modalVisible}
        message={modalMessage}
        onConfirm={() => setModalVisible(false)}
        textStyle={{ whiteSpace: "pre-line" }}
      />
    </Container>
  );
};

export default Signin;
