import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, AlertModal } from "../components";
import styled, { ThemeContext } from "styled-components";
import api from "../api/api";
import { ChevronLeft } from "react-feather";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 30px 20px;
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  position: relative;
  margin-bottom: 25px;
  width: 100%;
`;

const BackButton = styled.button`
  position: absolute;
  left: -10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 10px;
`;
const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
  background-color: #ddd;
  object-fit: cover;
`;
const NameText = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.black};
`;
const FormText = styled.p`
  width: 100%;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  text-align: left;
  line-height: 25px;
  padding-left: 15px;
  border-radius: 8px;
  margin-bottom: 60px;
  margin-left: 10px;
  white-space: pre-wrap; /* 줄 바꿈 유지 */
`;
const ButtonContainer = styled.div`
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
`;

const ApplicationDecisionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useContext(ThemeContext);

  const { formId, postId, name } = location.state || {};

  const [formData, setFormData] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  const profileFallback =
    "https://ssl.pstatic.net/static/pwe/address/img_profile.png";

  const fetchForm = async () => {
    if (!postId || !formId) {
      setAlertMessage("잘못된 접근입니다. 정보가 누락되었습니다.");
      setAlertVisible(true);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(`/posts/${postId}/form/${formId}`, {
        headers: { access: token },
      });

      setFormData(response.data.data); // content, userName, userImage (백엔드 구조 유지)
      console.log("폼데이터", response.data.data);
    } catch (e) {
      console.error("신청폼 조회 실패", e);
      setAlertMessage("신청서를 불러오는 데 실패했습니다.");
      setAlertVisible(true);
    }
  };

  const updateFormStatus = useCallback(
    async (status) => {
      if (!formData) return;

      try {
        const token = localStorage.getItem("accessToken");

        await api.patch(
          `/posts/${postId}/form/${formId}/status/${status}`,
          {},
          {
            headers: { access: token },
          }
        );

        // 수락일 경우 채팅방 초대
        if (status === "accept") {
          try {
            await api.post(
              "/chatroom/invite",
              {
                postId,
                username: formData.username, // API 호출 시 userImage가 아닌 userName 사용
              },
              { headers: { access: token } }
            );
          } catch (inviteErr) {
            console.error("채팅방 초대 실패", inviteErr);
            // 웹 환경에서는 Alert.alert 대신 AlertModal 상태를 사용하여 처리
            setAlertMessage("수락은 완료됐지만 채팅방 초대에 실패했습니다.");
            setOnConfirmAction(() => () => navigate(-1));
            setAlertVisible(true);
            return; // 실패 후 바로 함수 종료
          }
        }

        setAlertMessage(
          `신청서가 ${status === "accept" ? "수락" : "거절"}되었습니다.`
        );
        setOnConfirmAction(() => () => navigate(-1));
        setAlertVisible(true);
      } catch (e) {
        console.error(`신청서 ${status} 실패`, e);
        setAlertMessage("처리 중 오류가 발생했습니다.");
        setAlertVisible(true);
      }
    },
    [formData, postId, formId, navigate]
  );

  useEffect(() => {
    fetchForm();
  }, []);

  const handleConfirm = () => {
    setAlertVisible(false);
    if (onConfirmAction) {
      onConfirmAction();
      setOnConfirmAction(null);
    }
  };

  if (!formData) return <Container>로딩 중...</Container>;

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
      </HeaderContainer>

      <ProfileContainer>
        <ProfileImage
          src={formData.userImage || profileFallback}
          alt={`${name} 프로필`}
        />
        <NameText>{name}</NameText>
      </ProfileContainer>

      <FormText>{formData.content}</FormText>

      <ButtonContainer>
        <Button
          title="수락"
          onClick={() => updateFormStatus("accept")}
          style={{
            width: 82,
            height: 35,
            marginRight: 25,
          }}
          textStyle={{ fontSize: 16 }}
        />
        <Button
          title="거절"
          onClick={() => updateFormStatus("refuse")}
          style={{
            width: 82,
            height: 35,
            backgroundColor: theme.colors.lightBlue,
          }}
          textStyle={{ fontSize: 16, color: theme.colors.black }}
        />
      </ButtonContainer>

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={handleConfirm}
      />
    </Container>
  );
};

export default ApplicationDecisionPage;
