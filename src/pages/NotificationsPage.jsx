import React, { useState, useCallback, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { Feather } from "react-feather";
import api from "../api/api";
import { ChevronRight } from "react-feather";
import { AlertModal } from "../components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: white;
  padding: 10px 20px 0 20px;
`;

const Header = styled.h1`
  font-size: 16px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  padding: 5px;

  padding-top: 10px; /* 웹 환경에 맞게 상단 패딩 조정 */
`;

const NotificationItem = styled.div`
  padding: 5px 0 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const MessageBox = styled.div`
  flex: 1;
`;

const PostTitle = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin: 0 0 5px 0;
`;

const MessageText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
  margin: 0;
`;

const EmptyContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  width: 300px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  margin-bottom: 15px;
  text-align: center;
`;

const ModalInfoText = styled.p`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: gray;
  margin: 0 0 6px 0;
`;

const ModalAmount = styled.p`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 17px;
  text-align: center;
  margin: 0 0 30px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

const ConfirmButton = styled.button`
  width: 40%;
  background-color: ${({ theme }) => theme.colors.mainBlue};
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin: 5px;
  border: none;
  color: white;
  font-family: ${({ theme }) => theme.fonts.bold};
  cursor: pointer;
`;

const CancelButton = styled.button`
  width: 40%;
  background-color: #e6f0fa;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin: 5px;
  border: none;
  color: ${({ theme }) => theme.colors.mainBlue};
  font-family: ${({ theme }) => theme.fonts.bold};
  cursor: pointer;
`;

const NotificationsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    amount: 0,
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 유틸리티 함수를 인라인으로 재정의
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("ko-KR", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "시간 정보 없음";
    return timeString.slice(0, 5);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const res = await api.get("/notifications", {
        headers: { access: token },
      });
      console.log("🔔 알림 조회 성공:", res.data.data);
      setNotifications(res.data.data);
    } catch (error) {
      console.error("알림 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await localStorage.getItem("accessToken");
      if (!token) return;
      await api.patch("/notifications/read-all", null, {
        headers: { access: token },
      });
      console.log("✅ 전체 읽음 처리 완료");
    } catch (e) {
      console.log("❌ 알림 읽음 처리 실패", e);
    }
  };

  const fetchSessionInfo = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAlertMessage("세션 정보를 불러오기 위해 로그인이 필요합니다.");
        setAlertVisible(true);
        return;
      }
      const roomId = item.postId;
      const url = `/sessions/chatroom/${roomId}/active`;
      console.log(`📡 세션 정보 요청 URL: ${url}`);
      const res = await api.get(url, {
        headers: { access: token },
      });

      const sessionInfo = res.data.data;

      if (!sessionInfo) {
        setAlertMessage("진행 중인 세션이 없습니다");
        setAlertVisible(true);
        return;
      }

      console.log(`✅ 세션 정보 조회 성공 (roomId: ${roomId}):`, sessionInfo);

      setModalData({
        title: item.title,
        date: sessionInfo.sessionDate || "날짜 정보 없음",
        time: sessionInfo.sessionTime || "시간 정보 없음",
        location: sessionInfo.location || "장소 정보 없음",
        amount: sessionInfo.price || 0,
        somoimId: sessionInfo.somoimId || roomId,
        sessionId: sessionInfo.sessionNumber,
      });
      setModalVisible(true);
    } catch (error) {
      console.error(`❌ 세션 정보 조회 실패 (roomId: ${item.postId}):`, error);
      setAlertMessage("세션 정보를 불러오지 못했습니다");
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const handlePress = (item) => {
    switch (item.type) {
      case "FORM_APPROVED":
        if (item.roomId) {
          navigate(`/chat/${item.roomId}`);
        } else {
          setAlertMessage("채팅방 정보를 찾을 수 없습니다.");
          setAlertVisible(true);
        }
        break;
      case "FORM_REJECTED":
        navigate("/allposts");
        break;
      case "FORM_APPLY":
        if (!item.postId) {
          setAlertMessage("신청서 postId가 없습니다");
          setAlertVisible(true);
          return;
        }
        navigate(`/application-list/${item.postId}`);
        break;
      case "PAYMENT_COMPLETED":
        setAlertMessage("잊지 말고 꼭 참여해주세요!");
        setAlertVisible(true);
        break;
      case "PAYMENT_REQUESTED":
        if (item.postId) {
          fetchSessionInfo(item);
        } else {
          setAlertMessage("모임 정보를 찾을 수 없습니다");
          setAlertVisible(true);
        }
        break;
      default:
        console.warn("알 수 없는 알림 타입:", item.type);
        break;
    }
  };

  return (
    <Container>
      <Header>알림</Header>
      {loading ? (
        <p>로딩 중...</p>
      ) : notifications.length === 0 ? (
        <EmptyContainer>
          <EmptyText>알림이 존재하지 않습니다</EmptyText>
        </EmptyContainer>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((item) => (
            <li key={item.id}>
              <NotificationItem onClick={() => handlePress(item)}>
                <MessageBox>
                  <PostTitle>{item.title}</PostTitle>
                  <MessageText>{item.body}</MessageText>
                </MessageBox>
                <ChevronRight size={20} color="#999" />
              </NotificationItem>
            </li>
          ))}
        </ul>
      )}

      {/* 결제 정보 확인 모달 */}
      {modalVisible && (
        <StyledModal>
          <ModalBox>
            <ModalTitle>{modalData.title}</ModalTitle>
            <ModalInfoText>{formatDate(modalData.date)}</ModalInfoText>
            <ModalInfoText>{formatTime(modalData.time)}</ModalInfoText>
            <ModalInfoText>{modalData.location}</ModalInfoText>
            <ModalAmount>{modalData.amount.toLocaleString()}원</ModalAmount>
            <ButtonContainer>
              <ConfirmButton
                onClick={() => {
                  setModalVisible(false);
                  navigate(`/payment/${modalData.somoimId}`, {
                    state: {
                      amount: modalData.amount,
                      title: modalData.title,
                      somoimId: modalData.somoimId,
                      sessionId: modalData.sessionId,
                    },
                  });
                }}
              >
                수락
              </ConfirmButton>
              <CancelButton onClick={() => setModalVisible(false)}>
                거절
              </CancelButton>
            </ButtonContainer>
          </ModalBox>
        </StyledModal>
      )}

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
        }}
      />
    </Container>
  );
};

export default NotificationsPage;
