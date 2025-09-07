import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AlertModal } from "../components";
import api from "../api/api";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: white;
  padding: 5px;
  margin-top: 15px;
  min-height: 100vh;
`;

const Header = styled.h1`
  font-size: 16px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  padding: 5px;
  margin-bottom: 5px;
  padding-top: 0px; /* 웹 환경에 맞게 상단 패딩 조정 */
`;

const ChatItem = styled(Link)`
  padding: 10px 15px;
  background-color: white;
  display: block;
  text-decoration: none;
  min-height: 40px;
`;

const ChatHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin: 0;
  margin-bottom: 5px;
  color: #333;
`;

const ChatTime = styled.p`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.grey};
  margin: 0;
`;

const ChatMessage = styled.p`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.grey};
  margin: 0;
`;

const Separator = styled.div`
  margin-top: 3px;
  height: 1px;
  background-color: #e1e1e1;
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1; /* 부모 컨테이너의 남은 공간을 모두 차지하도록 flex-grow 추가 */
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
  text-align: center;
`;

const UnreadBadge = styled.div`
  background-color: red;
  border-radius: 10px;
  padding: 2px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 6px;
  margin-top: 6px;
`;

const UnreadText = styled.span`
  color: white;
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const LeftColumn = styled.div`
  flex: 1;
  padding-right: 10px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ChatListPage = () => {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchChatRooms = useCallback(async () => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.warn("⚠️ accessToken 없음");
        return;
      }

      const res = await api.get("/chatroom", {
        headers: { access: accessToken },
      });

      const list = Array.isArray(res.data?.dtoList) ? res.data.dtoList : [];

      const uniqueList = Array.from(new Map(list.map((c) => [c.id, c]))).map(
        ([_, v]) => v
      );

      const mapped = uniqueList.map((c) => ({
        id: String(c.id),
        postId: c.postId ? String(c.postId) : "",
        writerId: c.userId,
        title: c.roomName ?? "채팅방",
        lastMessage: c.lastMessage ?? "",
        time: c.lastMessageAt ? c.lastMessageAt.slice(11, 16) : "",
        participants: c.participants ?? [],
        unread: c.unread ?? 0,
      }));

      setChatRooms(mapped);
    } catch (e) {
      console.error("❌ 채팅방 목록 조회 실패:", e.response?.data ?? e.message);
      setAlertMessage("채팅방 목록을 불러오지 못했습니다.");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const renderItem = (item) => (
    <React.Fragment key={item.id}>
      <ChatItem to={`/chat/${item.id}`}>
        <RowWrapper>
          <LeftColumn>
            <ChatTitle>{item.title}</ChatTitle>
            <ChatMessage>{item.lastMessage}</ChatMessage>
          </LeftColumn>

          <RightColumn>
            <ChatTime>{item.time}</ChatTime>
            {item.unread > 0 && (
              <UnreadBadge>
                <UnreadText>
                  {item.unread > 99 ? "99+" : item.unread}
                </UnreadText>
              </UnreadBadge>
            )}
          </RightColumn>
        </RowWrapper>
      </ChatItem>
      <Separator />
    </React.Fragment>
  );

  return (
    <Container>
      <Header>채팅목록</Header>
      {loading ? (
        <p>로딩 중...</p>
      ) : chatRooms.length === 0 ? (
        <EmptyContainer>
          <EmptyText>참여중인 모임이 없습니다</EmptyText>
        </EmptyContainer>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chatRooms.map(renderItem)}
        </ul>
      )}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
    </Container>
  );
};

export default ChatListPage;
