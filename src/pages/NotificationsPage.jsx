import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { ChevronRight } from "react-feather";
import { FaStar, FaSpinner } from "react-icons/fa";
import { AlertModal } from "../components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: white;
  padding: 10px 20px 0 20px;
  min-height: 80vh;
`;

const Header = styled.h1`
  font-size: 16px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  padding: 5px;

  padding-top: 10px; /* 웹 환경에 맞게 상단 패딩 조정 */
`;

const NotificationItem = styled.div`
  padding: 20px 0 10px 0;
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
  text-align: center;
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column; /* 아이콘과 텍스트가 세로로 정렬되도록 */
  justify-content: center;
  align-items: center;
  height: 70vh; /* 전체 화면을 채우도록 */
  color: ${({ theme }) => theme.colors.mainBlue}; /* 아이콘 색상 */
  font-size: 0.9em; /* 로딩 텍스트 크기 */
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3em; /* 아이콘 크기 */
  animation: ${spin} 1.5s linear infinite; /* 스핀 애니메이션 적용 */
  margin-bottom: 10px; /* 아이콘과 텍스트 사이 간격 */
`;

const NotificationsPage = () => {
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
    somoimId: null,
    sessionId: null,
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

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

      // 1. 현재 사용자 이름 가져오기
      try {
        const userProfileRes = await api.get("/mypage/full", {
          headers: { access: token },
        }); // 가정: 프로필 API

        setCurrentUserName(userProfileRes.data.data || "사용자");
      } catch (e) {
        console.warn("사용자 이름 로드 실패, 기본값 사용:", e);
        setCurrentUserName("사용자");
      }

      // 2. 알림 목록 가져오기
      const res = await api.get("/notifications", {
        headers: { access: token },
        timeout: 5000, // 5초 타임아웃 설정
      });

      const responseData = res.data.data;

      // ⭐ 알림 데이터 구조 안전하게 처리
      let list = [];
      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (responseData && Array.isArray(responseData.notificationList)) {
        // API 응답이 { data: { notificationList: [...] } } 형태일 경우 대비
        list = responseData.notificationList;
      }

      setNotifications(list);
    } catch (error) {
      console.error("알림 조회 실패:", error);
      setNotifications([]);
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
      const roomId = item.roomId;
      const url = `/sessions/chatroom/${roomId}/active`;

      const res = await api.get(url, {
        headers: { access: token },
      });

      const sessionInfo = res.data.data;

      if (!sessionInfo) {
        setAlertMessage("진행 중인 세션이 없습니다");
        setAlertVisible(true);
        return;
      }

      setModalData({
        title: item.title,
        date: sessionInfo.sessionDate || "날짜 정보 없음",
        time: sessionInfo.sessionTime || "시간 정보 없음",
        location: sessionInfo.location || "장소 정보 없음",
        amount: sessionInfo.price || 0,
        somoimId: sessionInfo.somoimId || roomId,
        sessionId: sessionInfo.id,
      });

      setModalVisible(true);
    } catch (error) {
      console.error(`❌ 세션 정보 조회 실패 (roomId: ${item.postId}):`, error);
      setAlertMessage("세션 정보를 불러오지 못했습니다");
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    // modalData가 유효하고, 특히 sessionNumber(sessionId)가 설정되었을 때만 모달을 엽니다.
    if (modalData && modalData.sessionId) {
      setModalVisible(true);
    }
  }, [modalData]); // modalData가 변경될 때마다 실행

  const checkPaymentStatus = async (somoimId, sessionId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("토큰 없음");

      // 1. 현재 사용자 ID 획득 (API를 통해)
      const userRes = await api.get("/mypage/me", {
        headers: { access: token },
      });
      const currentUserId = userRes.data.data;

      if (!currentUserId) throw new Error("사용자 ID를 찾을 수 없습니다.");

      // 2. /payments/status (모든 참가자 상태 조회) POST 요청
      const statusRes = await api.post(
        `/payments/status`,
        { roomId: somoimId, sessionId: sessionId },
        { headers: { access: token, "Content-Type": "application/json" } }
      );

      const statuses = statusRes.data.data.userPaymentStatuses;

      // 3. 현재 사용자 ID와 일치하는 항목을 찾아 결제 상태 확인
      const currentUserStatus = statuses.find(
        (status) => Number(status.userId) === Number(currentUserId)
      );

      // 해당 사용자의 상태가 있고, paid가 true이면 true 반환
      return currentUserStatus && currentUserStatus.paid === true;
    } catch (error) {
      console.error("결제 상태 확인 실패:", error);
      // API 실패 시 (예: 404, 서버 에러) 안전하게 false 반환
      return false;
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
        navigate("/applicationlist", { state: { postId: item.postId } });
        break;
      case "PAYMENT_COMPLETED":
        setAlertMessage("잊지 말고 꼭 참여해주세요!");
        setAlertVisible(true);
        break;
      case "PAYMENT_REQUESTED":
        if (item.id) {
          fetchSessionInfo(item);
        } else {
          setAlertMessage("모임 정보를 찾을 수 없습니다");
          setAlertVisible(true);
        }
        break;
      case "REFUND_COMPLETED":
        setAlertMessage("환불이 완료되었습니다");
        setAlertVisible(true);
        break;
      default:
        console.warn("알 수 없는 알림 타입:", item.type);
        break;
    }
  };

  const handleConfirmPayment = async () => {
    const { somoimId, sessionId, amount, title } = modalData;

    if (!somoimId || !sessionId) {
      setModalVisible(false);
      setAlertMessage("결제 정보가 부족합니다.");
      setAlertVisible(true);
      return;
    }

    // 1. 결제 상태 확인
    const isPaid = await checkPaymentStatus(somoimId, sessionId);

    if (isPaid) {
      // 2. 이미 결제를 완료했다면 알림 띄우고 종료
      setModalVisible(false);
      setAlertMessage("이미 결제한 세션입니다");
      setAlertVisible(true);
      return;
    }

    // 3. 결제 전이라면 결제 페이지로 이동
    setModalVisible(false);
    const paymentParams = {
      amount,
      title,
      somoimId,
      sessionId,
      userName: currentUserName,
    };

    navigate("/payment", {
      state: paymentParams,
    });
  };

  return (
    <Container>
      <Header>알림</Header>
      {loading ? (
        <LoadingContainer>
          <LoadingIcon>
            <FaSpinner />
          </LoadingIcon>
          <p>알림을 불러오는 중입니다...</p>
        </LoadingContainer>
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
              <ConfirmButton onClick={handleConfirmPayment}>수락</ConfirmButton>
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
