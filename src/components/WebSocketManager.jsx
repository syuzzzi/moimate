import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/useAuth";
import { useNotificationOverlay } from "./NotificationOverlay.jsx";
// 웹 라우팅을 위해 useNavigate를 임포트합니다.
import { useNavigate } from "react-router-dom";
// SockJS와 STOMP 라이브러리는 웹 환경에서도 동일하게 사용 가능합니다.
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";

// ⭐ WEBSOCKET_URL 경로는 프로젝트 구조에 맞게 수정해주세요.
import { WEBSOCKET_URL } from "../config/apiConfig";

/**
 * 웹소켓 연결 및 알림 구독을 관리하는 컴포넌트입니다.
 * 이 컴포넌트는 App.jsx의 <NotificationOverlayProvider> 아래에 배치되어야 합니다.
 */
export default function WebSocketManager() {
  // 웹 라우팅을 위한 훅
  const navigate = useNavigate();

  const { accessToken, loading } = useAuth();
  const { showNotification } = useNotificationOverlay();
  const clientRef = useRef(null);

  useEffect(() => {
    // 1. 초기 로딩 상태 또는 토큰이 없을 경우 연결하지 않습니다.
    console.log(
      "[WS] loading:",
      loading,
      "accessToken:",
      accessToken ? "존재함" : "없음"
    );
    if (loading || !accessToken) return;

    // 2. 이전에 연결된 클라이언트가 있다면 비활성화합니다.
    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    // 3. STOMP 클라이언트 설정 및 연결
    const client = new StompClient({
      // SockJS를 사용하여 연결 주소와 토큰을 함께 전달합니다.
      webSocketFactory: () =>
        new SockJS(`${WEBSOCKET_URL}?token=${accessToken}`),

      // connectHeaders는 필요에 따라 유지하거나, URL 쿼리 파라미터로 대체 가능합니다.
      connectHeaders: {
        access: accessToken,
      },

      onConnect: () => {
        console.log("✅알림 Websocket 연결됨");

        // 4. 알림 구독
        client.subscribe("/user/queue/chat-notifications", (message) => {
          const payload = JSON.parse(message.body);

          showNotification(
            {
              roomName: payload.chatRoomName,
              senderName: payload.sender,
              message: payload.content,
            },
            // 5. 알림 클릭 시 실행될 콜백 함수 (웹 페이지 이동)
            () => {
              // React Router의 navigate 함수를 사용하여 채팅 페이지로 이동
              navigate(`/chat/${payload.roomId}`);
            }
          );
        });
      },
      //debug: (msg) => console.log("[🐞STOMP DEBUG]", msg),

      onWebSocketError: (error) => console.error("❌ WebSocket 에러:", error),
      onStompError: (frame) => console.error("❌ STOMP 에러:", frame),
      onWebSocketClose: () => console.warn("🔌 WebSocket 연결 종료"),
    });

    clientRef.current = client;
    client.activate();

    // 6. 클린업 함수: 컴포넌트 언마운트 시 또는 accessToken 변경 시 연결 해제
    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [accessToken, loading, showNotification, navigate]); // navigate를 의존성 배열에 추가

  // WebSocket Manager 컴포넌트는 UI를 렌더링하지 않으므로 null을 반환합니다.
  return null;
}
