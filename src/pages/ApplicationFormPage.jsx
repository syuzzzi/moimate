import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, AlertModal } from "../components";
import api from "../api/api";
import { ChevronLeft } from "react-feather";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 30px 20px;
  height: 100vh;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  position: relative;
  margin-bottom: 30px;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ApplicationInput = styled.textarea`
  width: 100%;
  height: 230px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  resize: none;
  outline: none;
  box-sizing: border-box;
`;

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { postId } = location.state || {};

  const [form, setForm] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  useEffect(() => {
    setDisabled(form.trim().length === 0 || !postId);
  }, [form, postId]);

  useEffect(() => {
    if (!postId) {
      setAlertMessage("잘못된 접근입니다. 모임 ID를 찾을 수 없습니다.");
      setOnConfirmAction(() => () => navigate(-1));
      setAlertVisible(true);
    }
  }, [postId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (disabled || !postId) return;

    try {
      const accessToken = localStorage.getItem("accessToken");

      await api.post(
        `/posts/${postId}/form`,
        { content: form },
        {
          headers: {
            access: accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      setAlertMessage("지원서가 성공적으로 제출되었습니다.");
      setOnConfirmAction(() => () => {
        navigate(-1, { state: { submissionSuccess: true } });
      });
      setAlertVisible(true);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      console.error("신청서 제출 실패:", message);

      if (message.includes("이미 신청폼을 제출")) {
        setAlertMessage("이미 해당 모임에 신청서를 제출하셨습니다.");
        setOnConfirmAction(() => () => navigate(-1));
      } else if (error.response?.status === 401) {
        setAlertMessage("로그인이 필요합니다.");
        setOnConfirmAction(() => () => navigate("/login"));
      } else {
        setAlertMessage(`제출 중 문제가 발생했습니다. \n (${message})`);
        setOnConfirmAction(() => () => setAlertVisible(false));
      }
      setAlertVisible(true);
    }
  }, [form, postId, navigate, disabled]);

  const handleConfirm = () => {
    setAlertVisible(false);
    if (onConfirmAction) {
      onConfirmAction();
      setOnConfirmAction(null);
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
      </HeaderContainer>
      <ApplicationInput
        value={form}
        onChange={(e) => setForm(e.target.value)}
        placeholder={"자기소개 및 지원동기"}
        rows={10}
        style={{ width: "100%", resize: "none" }}
        textStyle={{ height: 200, fontSize: 15 }}
      />
      <Button
        title="제출"
        disabled={disabled}
        onClick={handleSubmit}
        style={{
          width: 82,
          height: 35,
          marginTop: 20,
          alignSelf: "center",
        }}
        textStyle={{ fontSize: 16 }}
      />
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={handleConfirm}
        onCancel={handleConfirm}
      />
    </Container>
  );
};

export default ApplicationFormPage;
