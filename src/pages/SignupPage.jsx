import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Input, Button, ErrorMessage, AlertModal } from "../components";
import { validateEmail, removeWhitespace } from "../utils/utils";
import api from "../api/api";
import { ChevronLeft } from "react-feather";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 30px;
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
const EmailContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const Gender = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;
const Label = styled.label`
  font-size: 15px;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
`;
const GenderContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;
const GenderOption = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 100px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;
const GenderCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 14px;
  border-width: 2px;
  border-style: solid;
  border-color: ${({ theme, selected }) =>
    selected ? theme.colors.mainBlue : theme.colors.grey};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;
const GenderInnerCircle = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.mainBlue};
`;
const GenderLabel = styled.span`
  width: 30px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.black};
`;

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] =
    useState("");

  const [disabled, setDisabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    setDisabled(
      !(
        email &&
        name &&
        password &&
        passwordConfirm &&
        phone &&
        gender &&
        !emailErrorMessage &&
        !passwordErrorMessage &&
        !passwordConfirmErrorMessage
      )
    );
  }, [
    email,
    name,
    password,
    passwordConfirm,
    phone,
    gender,
    emailErrorMessage,
    passwordErrorMessage,
    passwordConfirmErrorMessage,
  ]);

  const _handleEmailChange = (e) => {
    let changeEmail = removeWhitespace(e.target.value);
    changeEmail = changeEmail.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setEmail(changeEmail);
    setEmailErrorMessage(
      validateEmail(changeEmail) ? "" : "이메일을 올바르게 입력해주세요"
    );
  };

  const checkEmailDuplicate = async () => {
    try {
      const response = await api.post("/auth/signup/email/checkemail", {
        email: email,
      });

      if (response.data.data === true) {
        setModalMessage("사용 가능한 이메일입니다!");
      } else {
        setModalMessage("이미 사용 중인 이메일입니다");
      }
      setModalVisible(true);
    } catch (error) {
      if (error.response) {
        setModalMessage("이미 사용 중인 이메일입니다");
      } else {
        setModalMessage("이메일 확인 중 문제가 발생했습니다.");
      }
      setModalVisible(true);
    }
  };

  const _handleNameChange = (e) => {
    const changeName = removeWhitespace(e.target.value);
    setName(changeName);
  };

  const _handlePasswordChange = (e) => {
    // ⭐️ e: 웹 표준 이벤트 객체
    const changePassword = removeWhitespace(e.target.value); // ⭐️ e.target.value 사용
    setPassword(changePassword);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(changePassword)) {
      setPasswordErrorMessage("영어와 숫자를 혼합한 8자 이상이어야 합니다");
    } else {
      setPasswordErrorMessage("");
    }

    if (passwordConfirm) {
      setPasswordConfirmErrorMessage(
        changePassword !== passwordConfirm ? "비밀번호가 일치하지 않습니다" : ""
      );
    }
  };

  const _handlePasswordConfirmChange = (e) => {
    const changePasswordConfirm = removeWhitespace(e.target.value);
    setPasswordConfirm(changePasswordConfirm);
    setPasswordConfirmErrorMessage(
      password !== changePasswordConfirm ? "비밀번호가 일치하지 않습니다" : ""
    );
  };

  const _handlePhoneChange = (e) => {
    let changePhone = e.target.value.replace(/[^0-9]/g, "");

    if (!changePhone.startsWith("010")) {
      changePhone = "010";
    }

    if (changePhone.length > 11) {
      changePhone = changePhone.slice(0, 11);
    }

    setPhone(changePhone);
  };

  const _handleSignup = async () => {
    try {
      const response = await api.post("/auth/signup/email", {
        email,
        name,
        password,
        gender,
      });
      console.log("회원가입 성공:", response.data);
      navigate("/done");
    } catch (error) {
      if (error.response) {
        console.error("서버 오류:", error.response.data);
      } else if (error.request) {
        console.error("네트워크 오류:", error.request);
      } else {
        console.error("오류 발생:", error.message);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexGrow: 1, justifyContent: "center" }}>
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
        <EmailContainer>
          <Input
            label="이메일"
            placeholder="example@email.com"
            value={email}
            onChange={_handleEmailChange}
            style={{ marginRight: 7, width: "77%" }}
          />
          <Button
            title="중복확인"
            onClick={checkEmailDuplicate}
            disabled={!email || !!emailErrorMessage}
            style={{
              width: "90px",
              height: "50px",
              borderRadius: "5px",
              marginTop: 22,
            }}
            textStyle={{ fontSize: 15, color: "#fff" }}
          />
        </EmailContainer>
        <ErrorMessage message={emailErrorMessage} />
        <Input
          label="이름"
          value={name}
          onChange={_handleNameChange}
          style={{ width: "100%", paddingBottom: 20 }}
        />
        <Input
          label="비밀번호"
          value={password}
          onChange={_handlePasswordChange} // ⭐️ 수정된 핸들러 연결
          isPassword={true}
          style={{ width: "100%", paddingBottom: 2 }}
        />
        {/* 비밀번호 오류 메시지 위치 */}
        <ErrorMessage message={passwordErrorMessage} />

        <Input
          label="비밀번호 확인"
          value={passwordConfirm}
          onChange={_handlePasswordConfirmChange}
          isPassword={true}
          style={{ width: "100%" }}
        />
        <ErrorMessage message={passwordConfirmErrorMessage} />
        <Input
          label="전화번호"
          placeholder="01012345678"
          value={phone}
          onChange={_handlePhoneChange}
          style={{ width: "100%", paddingBottom: 20 }}
        />
        <Gender>
          <Label>성별</Label>
          <GenderContainer style={{ marginTop: 8 }}>
            <GenderOption onClick={() => setGender("FEMALE")}>
              <GenderCircle selected={gender === "FEMALE"}>
                {gender === "FEMALE" && <GenderInnerCircle />}
              </GenderCircle>
              <GenderLabel>여성</GenderLabel>
            </GenderOption>

            <GenderOption onClick={() => setGender("MALE")}>
              <GenderCircle selected={gender === "MALE"}>
                {gender === "MALE" && <GenderInnerCircle />}
              </GenderCircle>
              <GenderLabel>남성</GenderLabel>
            </GenderOption>
          </GenderContainer>
        </Gender>

        <Button
          title="가입"
          onClick={_handleSignup}
          disabled={disabled}
          style={{ width: "100%" }}
        />
        <AlertModal
          visible={modalVisible}
          message={modalMessage}
          onConfirm={() => setModalVisible(false)}
        />
      </Container>
    </div>
  );
};

export default SignupPage;
