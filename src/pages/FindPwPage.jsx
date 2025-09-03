import React, { useState, useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Button, ErrorMessage, AlertModal, Input } from "../components";
import api from "../api/api";
import { validateEmail, removeWhitespace } from "../utils/utils";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 30px;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const FindPw = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [authNum, setAuthNum] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] =
    useState("");
  const [disabled, setDisabled] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isPwChanged, setIsPwChanged] = useState(false);

  useEffect(() => {
    setDisabled(
      !(
        email &&
        authNum &&
        password &&
        passwordConfirm &&
        !emailErrorMessage &&
        !passwordConfirmErrorMessage &&
        isAuthVerified
      )
    );
  }, [
    email,
    authNum,
    password,
    passwordConfirm,
    emailErrorMessage,
    passwordConfirmErrorMessage,
    isAuthVerified,
  ]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const _handleEmailChange = (e) => {
    let changeEmail = removeWhitespace(e.target.value);
    changeEmail = changeEmail.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setEmail(changeEmail);
    setEmailErrorMessage(
      validateEmail(changeEmail) ? "" : "이메일을 올바르게 입력해주세요"
    );
  };

  const _handleAuthNumChange = (e) => {
    let changeAuthNum = e.target.value.replace(/[^0-9]/g, "");
    if (changeAuthNum.length > 6) {
      changeAuthNum = changeAuthNum.slice(0, 6);
    }
    setAuthNum(changeAuthNum);
  };

  const _handlePasswordChange = (e) => {
    const changePassword = removeWhitespace(e.target.value);
    setPassword(changePassword);
  };

  const _handlePasswordConfirmChange = (e) => {
    const changePasswordConfirm = removeWhitespace(e.target.value);
    setPasswordConfirm(changePasswordConfirm);
    setPasswordConfirmErrorMessage(
      password !== changePasswordConfirm ? "비밀번호가 일치하지 않습니다" : ""
    );
  };

  return (
    <PageWrapper>
      <RowContainer>
        <Input
          label="이메일"
          placeholder="example@email.com"
          value={email}
          onChange={_handleEmailChange}
          style={{
            marginRight: 7,
            width: "74%",
          }}
        />
        <Button
          title={resendTimer > 0 ? `${resendTimer}초` : "전송"}
          onClick={async () => {
            try {
              const { data: result } = await api.post(
                "/auth/password/find",
                { email },
                { headers: { "Content-Type": "application/json" } }
              );
              setModalMessage(result.message);
              setModalVisible(true);
              setResendTimer(180);
            } catch (error) {
              // ✅ 백엔드 응답 메시지를 확인하여 사용자 친화적인 메시지로 변경
              const serverMessage = error?.response?.data?.message;
              if (serverMessage && serverMessage.includes("요청한")) {
                setModalMessage("가입되지 않은 이메일입니다.");
              } else {
                setModalMessage(serverMessage || "이메일 전송에 실패했습니다.");
              }
              setModalVisible(true);
            }
          }}
          disabled={!email || !!emailErrorMessage || resendTimer > 0}
          style={{
            width: 80,
            height: 50,
            marginTop: 22,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: theme.colors.mainBlue,
          }}
          textStyle={{
            color: theme.colors.white,
            fontSize: 15,
            fontFamily: theme.fonts.bold,
            marginLeft: 0,
          }}
        />
      </RowContainer>
      <ErrorMessage message={emailErrorMessage} />
      <RowContainer style={{ marginBottom: 17 }}>
        <Input
          label="인증번호"
          value={authNum}
          onChange={_handleAuthNumChange}
          disabled={isAuthVerified}
          style={{
            marginRight: 7,
            width: "74%",
          }}
        />
        <Button
          title="확인"
          onClick={async () => {
            try {
              const { data: result } = await api.post(
                "/auth/password/otp",
                { email, otp: authNum },
                { headers: { "Content-Type": "application/json" } }
              );
              if (result.data === true) {
                setIsAuthVerified(true);
                setModalMessage(result.message);
                setModalVisible(true);
              } else {
                setModalMessage("올바르지 않은 번호입니다");
                setModalVisible(true);
              }
            } catch (error) {
              setModalMessage(error?.response?.data?.message || "인증 실패");
              setModalVisible(true);
            }
          }}
          disabled={
            isAuthVerified ||
            !email ||
            !!emailErrorMessage ||
            authNum.length !== 6
          }
          style={{
            width: 80,
            height: 50,
            marginTop: 22,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: theme.colors.mainBlue,
          }}
          textStyle={{
            color: theme.colors.white,
            fontSize: 15,
            fontFamily: theme.fonts.bold,
            marginLeft: 0,
          }}
        />
      </RowContainer>

      <Input
        label="비밀번호"
        value={password}
        onChange={_handlePasswordChange}
        isPassword={true}
        disabled={!isAuthVerified}
        style={{
          width: "100%",
          paddingBottom: 17,
        }}
      />
      <Input
        label="비밀번호 확인"
        value={passwordConfirm}
        onChange={_handlePasswordConfirmChange}
        isPassword={true}
        disabled={!isAuthVerified}
        style={{
          width: "100%",
        }}
      />
      <ErrorMessage message={passwordConfirmErrorMessage} />
      <Button
        title="변경"
        onClick={async () => {
          try {
            await api.patch(
              "/auth/password/find",
              { email, password },
              { headers: { "Content-Type": "application/json" } }
            );
            setIsPwChanged(true);
            setModalMessage("비밀번호 변경 성공");
            setModalVisible(true);
          } catch (error) {
            setModalMessage(
              error?.response?.data?.message || "비밀번호 변경 실패"
            );
            setModalVisible(true);
          }
        }}
        disabled={disabled}
        style={{
          width: "100%",
          marginTop: 60,
        }}
        textStyle={{ marginLeft: 0 }}
      />
      <AlertModal
        visible={modalVisible}
        message={modalMessage}
        onConfirm={() => {
          setModalVisible(false);
          if (isPwChanged) {
            setIsPwChanged(false);
            navigate(-1);
          }
        }}
      />
    </PageWrapper>
  );
};

export default FindPw;
