import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertModal } from "../components";
import api from "../api/api";
import { ChevronRight, ChevronLeft } from "react-feather";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 30px 20px;
  min-height: 100vh;
  position: relative;
  margin: 0;
  width: 100%;
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

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  /* 목록이 많을 경우 스크롤을 위해 높이를 지정할 수 있음 */
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 20px;
  object-fit: cover;
  background-color: #ccc;
`;

const NameText = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: left;
`;

const PlaceholderText = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: #a1a1a1;
  margin-top: 150px;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

// ────────────────────────────── Component
const ApplicationListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { postId } = location.state || {}; // postId가 항상 존재한다고 가정

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  const profileFallback =
    "https://ssl.pstatic.net/static/pwe/address/img_profile.png";

  // 신청서 목록을 불러오는 함수
  const fetchApplications = useCallback(async () => {
    // postId가 없으면 로딩만 false로 설정하고 API 호출을 건너뜁니다.
    if (!postId) {
      setLoading(false);
      // postId가 누락되었을 경우를 대비한 방어적인 로직 (모달은 제거)
      console.error("PostId가 누락되어 신청서 목록을 불러올 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setAlertMessage("로그인이 필요합니다.");
        setOnConfirmAction(() => () => navigate("/login"));
        setAlertVisible(true);
        return;
      }

      const response = await api.get(`/posts/${postId}/form/list`, {
        headers: { access: accessToken },
      });

      const formList = response.data.data.forms;
      setApplications(formList);
    } catch (error) {
      console.error("신청서 불러오기 실패: ", error);
      setAlertMessage("신청서를 불러오는 데 실패했습니다.");
      setOnConfirmAction(null);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleItemClick = (item) => {
    // 상세 페이지로 이동
    navigate("/applicationdecision", {
      state: {
        postId,
        formId: item.formId,
        name: item.userName,
        image: item.userImage || profileFallback,
      },
    });
  };

  const renderItem = (item) => (
    <ListItem key={item.formId} onClick={() => handleItemClick(item)}>
      <ProfileImage
        src={item.userImage || profileFallback}
        alt={`${item.userName} 프로필`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = profileFallback;
        }}
      />
      <NameText>{item.userName}</NameText>
      <ChevronRight size={20} color="#999" />
    </ListItem>
  );

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

      {loading ? (
        <LoadingContainer>
          <PlaceholderText style={{ marginTop: 0 }}>
            신청서를 불러오는 중...
          </PlaceholderText>
        </LoadingContainer>
      ) : applications.length === 0 ? (
        <PlaceholderText>신청서가 없습니다</PlaceholderText>
      ) : (
        <ListWrapper>{applications.map(renderItem)}</ListWrapper>
      )}

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={handleConfirm}
        onCancel={handleConfirm}
      />
    </Container>
  );
};

export default ApplicationListPage;
