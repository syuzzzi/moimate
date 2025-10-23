import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import styled, { keyframes, css } from "styled-components";

// --------------------------------------------------
// 1. 애니메이션 정의 (Keyframes)
// --------------------------------------------------

const slideIn = keyframes`
  from {
    transform: translateY(-100px);
  }
  to {
    transform: translateY(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
`;

// --------------------------------------------------
// 2. Styled Components 정의 (스타일 대체)
// --------------------------------------------------

const Banner = styled.div`
  position: fixed; /* 웹 환경에서는 'absolute' 대신 'fixed'를 사용하여 뷰포트에 고정 */
  top: 36px;
  left: 20px;
  right: 20px;
  background-color: rgba(228, 225, 225, 0.9);
  border-radius: 12px;
  padding: 14px 14px;
  z-index: 9999;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05); /* elevation 대신 box-shadow 사용 */
  cursor: pointer;

  /* 애니메이션 적용 */
  ${(props) =>
    props.$isVisible
      ? css`
          animation: ${slideIn} 0.3s forwards;
        `
      : css`
          animation: ${slideOut} 0.3s forwards;
        `}
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 6px;
  /* 실제 웹 환경에 맞는 아이콘 경로를 지정해야 합니다 */
`;

const TextContainer = styled.div`
  flex: 1;
  overflow: hidden; /* 텍스트 오버플로 처리 */
`;

const Title = styled.span`
  display: block;
  color: #000;
  font-size: 14px;
  font-weight: bold;
  line-height: 14px;
  margin-bottom: 2px;
`;

const Message = styled.span`
  display: block;
  color: #000;
  font-size: 14px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 말줄임표 처리 */
`;

const Sender = styled.span`
  font-weight: bold;
  color: #000;
`;

// --------------------------------------------------
// 3. Context 및 Provider (기능 대체)
// --------------------------------------------------

const NotificationOverlayContext = createContext();

export const NotificationOverlayProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(null);
  const [isExiting, setIsExiting] = useState(false); // 애니메이션 상태 추적

  const showNotification = (
    { roomName, senderName, message: msgText },
    onPress = null
  ) => {
    // 이미 표시 중이면 기존 애니메이션 중단하고 새 알림 표시
    if (visible) {
      clearTimeout(window.notificationTimeout);
      setIsExiting(false);
    }

    setMessage({ roomName, senderName, message: msgText, onPress });
    setVisible(true);
  };

  const hideNotification = () => {
    if (visible && !isExiting) {
      setIsExiting(true); // 퇴장 애니메이션 시작
      // 애니메이션 시간(300ms) 후에 실제로 숨김
      setTimeout(() => {
        setVisible(false);
        setMessage(null);
        setIsExiting(false);
      }, 300);
    }
  };

  useEffect(() => {
    if (visible && !isExiting) {
      // 3초 후 숨김 애니메이션 시작
      window.notificationTimeout = setTimeout(() => {
        hideNotification();
      }, 3000);
    }

    return () => {
      clearTimeout(window.notificationTimeout);
    };
  }, [visible, isExiting]);

  // isExiting 상태를 통해 퇴장 애니메이션이 진행 중일 때만 컴포넌트를 유지
  const shouldRender = visible || isExiting;

  return (
    <NotificationOverlayContext.Provider value={{ showNotification }}>
      <>
        {children}
        {shouldRender && message && (
          <Banner
            $isVisible={visible && !isExiting} // 등장/유지 시 true, 퇴장 시 false
            // 퇴장 애니메이션이 끝난 후 컴포넌트 제거는 hideNotification 내부에서 처리됨
          >
            <div onClick={message.onPress}>
              <Row>
                {/* 웹 환경에 맞는 이미지 경로 사용 */}
                <Icon src="assets/images/favicon.png" alt="App Icon" />
                <TextContainer>
                  <Title>{message.roomName}</Title>
                  <Message>
                    <Sender>{message.senderName}: </Sender>
                    {message.message}
                  </Message>
                </TextContainer>
              </Row>
            </div>
          </Banner>
        )}
      </>
    </NotificationOverlayContext.Provider>
  );
};

export const useNotificationOverlay = () =>
  useContext(NotificationOverlayContext);
