// ChatPage.jsx (web)
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Menu as MenuIcon,
  Send as SendIcon,
  X,
  LogOut,
  AlertCircle,
} from "react-feather";
import throttle from "lodash.throttle";
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";
import { v4 as uuid } from "uuid";

import api from "../api/api";
import { Button, AlertModal } from "../components";
import ChatModal from "../components/ChatModal";
import { WEBSOCKET_URL } from "../config/apiConfig.js";

// ────────────────────────────── Styled
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
`;

const ChatHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 60px;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
`;

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 36px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const HeaderTitleWrap = styled.div`
  flex: 1;
  text-align: center;
  line-height: 1.1;
`;

const Title = styled.div`
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
`;

const RoundIndicator = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: #888;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const ChatArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const MessageList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column-reverse; /* 최신 메시지 하단 고정 느낌 */
  overflow-y: auto;
  padding: 8px 12px;
  gap: 6px;
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: ${({ $right }) => ($right ? "row-reverse" : "row")};
  align-items: flex-start;
  gap: 8px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #ccc;
  flex: 0 0 36px;
`;

const MessageGroup = styled.div`
  max-width: 72%;
  display: flex;
  flex-direction: column;
  align-items: ${({ $right }) => ($right ? "flex-end" : "flex-start")};
`;

const Sender = styled.div`
  margin: 0 4px 4px;
  font-size: 13px;
  color: #333;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const BubbleRow = styled.div`
  display: flex;
  flex-direction: ${({ $right }) => ($right ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 6px;
`;

const Bubble = styled.div`
  border-radius: 12px;
  padding: 10px 14px;
  background: ${({ $right, theme }) =>
    $right ? theme.colors.mainBlue : theme.colors.lightBlue};
  color: ${({ $right, theme }) =>
    $right ? theme.colors.white : theme.colors.black};
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  word-break: break-word;
`;

const Time = styled.div`
  font-size: 10px;
  color: #888;
  margin-bottom: 2px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const InputBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #ddd;

  padding: 10px 12px;
  flex-shrink: 0;
`;

const TextInput = styled.input`
  flex: 1;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 44px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: flex-end;
  z-index: 50;
`;

const SidePanel = styled.aside`
  position: relative;
  width: min(200px, 85vw);
  height: 100%;

  background: #fff;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
`;
const SideButtonContainer = styled.div`
  margin-top: 20px;
  padding-bottom: 350px;
  justify-content: center;
  align-items: center;
`;

const SideTitle = styled.div`
  margin-top: 36px;
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
`;

const SideScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 12px 0 8px;
`;

const ParticipantRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
`;

const ParticipantLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PName = styled.div`
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.lightBlue};
  border-radius: 999px;
  font-size: 11px;
`;

const StatusDot = styled.span`
  transform: translateY(-1px);
`;

const DangerExit = styled(HeaderButton)`
  position: absolute;
  bottom: 40px;
  right: 14px;
  color: #ff2e2e;
`;

// ────────────────────────────── Utils
const profileFallback =
  "https://ssl.pstatic.net/static/pwe/address/img_profile.png";

// ────────────────────────────── Component
const ChatPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [participants, setParticipants] = useState([]);
  const [participantStatus, setParticipantStatus] = useState({}); // { [userId]: '참여'|'불참' }
  const [meetingActive, setMeetingActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionDate, setSessionDate] = useState(null);
  const [sessionTime, setSessionTime] = useState(null);
  const [hostExists, setHostExists] = useState(true);
  const [myRole, setMyRole] = useState();

  const [sideOpen, setSideOpen] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);

  // start form defaults
  const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const getNow = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };
  const [formDate, setFormDate] = useState(getToday());
  const [formTime, setFormTime] = useState(getNow());
  const [formPrice, setFormPrice] = useState("10000");
  const [formLocation, setFormLocation] = useState("");

  const stompRef = useRef(null);
  const lastSentReadIdRef = useRef(null);

  const ensureId = (msg) => ({ ...msg, id: msg.id ?? uuid() });

  // ───────── Load me
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await api.get("/mypage/me", {
          headers: { access: token },
        });
        setCurrentUserId(Number(data.data));
      } catch (e) {
        console.error("유저 정보 가져오기 실패", e);
      }
    })();
  }, []);

  // ───────── Participants
  const fetchParticipants = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await api.get(`/chatroom/${roomId}/participants`, {
        headers: { access: token },
      });
      const list =
        (data?.dtoList ?? []).map((p) => ({
          userId: p.userId ?? null,
          name: p.participantName,
          image: p.image,
          status: p.status ?? null,
        })) || [];
      setParticipants(list);
      return list;
    } catch (e) {
      console.error("참가자 목록 불러오기 실패", e.response?.data ?? e.message);
      return [];
    }
  }, [roomId]);

  // ───────── Session & payment status
  const fetchSessionStatus = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const pRes = await api.get(`/chatroom/${roomId}/participants`, {
        headers: { access: token },
      });
      const list =
        (pRes?.data?.dtoList ?? []).map((p) => ({
          userId: p.userId ?? null,
          name: p.participantName,
          image: p.image,
          status: p.status ?? null,
        })) || [];
      setParticipants(list);

      const sRes = await api.get(`/sessions/chatroom/${roomId}/active`, {
        headers: { access: token },
      });

      if (!sRes.data.data) {
        setMeetingActive(false);
        setParticipantStatus({});
        return;
      }

      const s = sRes.data.data;
      setMeetingActive(true);
      setCurrentSessionId(s.id);
      setCurrentRound(s.sessionNumber);
      setSessionDate(s.sessionDate);
      setSessionTime(s.sessionTime);

      const payRes = await api.post(
        `/payments/status`,
        { roomId, sessionId: s.id },
        { headers: { access: token } }
      );

      const map = {};
      const statuses = payRes?.data?.data?.userPaymentStatuses ?? [];
      statuses.forEach((u) => {
        map[u.userId] = u.paid ? "참여" : "불참";
      });
      list.forEach((p) => {
        if (!map[p.userId]) map[p.userId] = "불참";
      });
      setParticipantStatus(map);
    } catch (e) {
      console.error("세션 상태 로드 실패:", e.response?.data ?? e.message);
    }
  }, [roomId]);

  // ───────── History
  const fetchHistory = useCallback(
    async (plist) => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await api.get(`/chatroom/${roomId}`, {
          headers: { access: token },
        });
        const history = (data?.data?.messages ?? []).map((m) => {
          const matchedUser = plist.find(
            (p) => Number(p.userId) === Number(m.senderId)
          );
          return ensureId({
            id: m.id || m.messageId || uuid(),
            senderId: m.senderId,
            name: m.sender,
            image: matchedUser?.image ?? null,
            text: m.content,
            time: m.createdAt?.slice(11, 16) ?? "",
          });
        });
        setTitle(data.data.roomName);
        setHostExists(!data.data.deleteFlag);
        setMyRole(data.data.role);
        setMessages(history);
      } catch (e) {
        console.error("메시지 불러오기 실패", e.response?.data ?? e.message);
      }
    },
    [roomId]
  );

  // ───────── WebSocket
  const connectSocket = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const client = new StompClient({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: { access: token },
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, ({ body }) => {
          try {
            const raw = JSON.parse(body);
            const mapped = ensureId({
              id: raw.id || raw.messageId || uuid(),
              senderId: raw.senderId,
              name: raw.senderName || raw.sender,
              image: raw.profileImage,
              text: raw.content,
              time: (raw.sentAt || raw.createdAt)?.slice(11, 16) ?? "",
            });
            setMessages((prev) => {
              if (prev.find((m) => m.id === mapped.id)) return prev;
              const next = [mapped, ...prev];

              // 최신 메시지 기준 읽음보고(쓰로틀)
              const newestId = next[0]?.id || null;
              throttledPostRead(newestId);
              return next;
            });
          } catch (e) {
            console.error("메시지 파싱 실패:", e);
          }
        });
      },
      onStompError: console.error,
      onWebSocketError: console.error,
    });
    client.activate();
    stompRef.current = client;
  }, [roomId]);

  // init / cleanup
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      const plist = await fetchParticipants();
      await connectSocket();
      await fetchHistory(plist);
      await fetchSessionStatus();
      // 최초 읽음 표시 (안전빵)
      const accessToken = localStorage.getItem("accessToken");
      try {
        await api.post(
          `/chatroom/${roomId}/read`,
          {},
          { headers: { access: accessToken } }
        );
      } catch {}
    })();
    return () => {
      stompRef.current?.deactivate();
      stompRef.current = null;
      throttledPostRead.cancel();
      lastSentReadIdRef.current = null;
    };
  }, [roomId]);

  // ───────── 읽음 보고
  const postRead = useCallback(
    async (latestId) => {
      if (!latestId) return;
      const accessToken = localStorage.getItem("accessToken");
      try {
        await api.post(
          `/chatroom/${roomId}/read`,
          { lastMessageId: latestId },
          { headers: { access: accessToken } }
        );
      } catch (e) {
        console.warn("read 보고 실패:", e.response?.data ?? e.message);
      }
    },
    [roomId]
  );

  const throttledPostRead = useMemo(
    () =>
      throttle(
        async (latestId) => {
          if (!latestId) return;
          if (lastSentReadIdRef.current === latestId) return;
          await postRead(latestId);
          lastSentReadIdRef.current = latestId;
        },
        1200,
        { leading: true, trailing: true }
      ),
    [postRead]
  );

  const latestMessageId = useMemo(() => messages?.[0]?.id ?? null, [messages]);
  useEffect(() => {
    throttledPostRead(latestMessageId);
  }, [latestMessageId, throttledPostRead]);

  // ───────── actions
  const handleSend = () => {
    if (!input.trim()) return;
    if (!stompRef.current?.connected) {
      console.warn("소켓 연결 중. 잠시 후 시도하세요.");
      return;
    }
    stompRef.current.publish({
      destination: `/app/${roomId}`,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: input, roomId }),
    });
    setInput("");
    throttledPostRead(latestMessageId);
  };

  const leaveRoom = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await api.delete(`/chatroom/${roomId}`, { headers: { access: token } });
      navigate(-1);
    } catch (e) {
      console.error("채팅방 나가기 실패", e.response?.data || e.message);
    }
  };

  const handleStartMeeting = async () => {
    if (meetingActive) return;
    const token = localStorage.getItem("accessToken");
    const { data } = await api.post(
      "/sessions/start",
      {
        roomId,
        sessionDate: formDate,
        sessionTime: formTime,
        price: parseInt(formPrice, 10),
        location: formLocation,
      },
      { headers: { access: token, "Content-Type": "application/json" } }
    );

    const s = data.data;
    setCurrentSessionId(s.id);
    setCurrentRound(s.sessionNumber);
    setMeetingActive(true);
    setSessionDate(s.sessionDate);
    setSessionTime(s.sessionTime);

    const list = await fetchParticipants();
    const initial = {};
    list.forEach((p) => (initial[p.userId] = "불참"));
    setParticipantStatus(initial);
    setStartModalOpen(false);
  };

  const handleEndMeeting = async () => {
    if (!currentSessionId) return;
    setEndConfirmOpen(false);
    try {
      setSideOpen(false);
      const token = localStorage.getItem("accessToken");
      const res = await api.post(
        "/payments/info",
        {
          userId: currentUserId,
          sessionId: currentSessionId,
          somoimId: roomId,
        },
        { headers: { access: token } }
      );
      const { impUid, amount } = res.data.data || {};
      // 참여확인 화면으로 이동 (원하는 경로로 교체 가능)
      navigate("/confirm", {
        state: {
          roomId,
          sessionId: currentSessionId,
          participants,
          participantStatus,
          currentRound,
          sessionDate,
          impUid,
          amount,
        },
      });
    } catch (e) {
      console.error(
        "모임 종료/결제 정보 조회 실패:",
        e.response?.data ?? e.message
      );
      // 프로젝트의 공통 Alert 사용 시 아래 교체
      window.alert("결제 정보 조회에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // ───────── render helpers
  const renderMessage = (m, i) => {
    const prev = messages[i + 1];
    const newer = i > 0 ? messages[i - 1] : null;
    const isMe = Number(m.senderId) === Number(currentUserId);
    const firstOfGroup = !prev || prev.name !== m.name;
    const showTime =
      !newer || newer.senderId !== m.senderId || newer.time !== m.time;

    return (
      <MessageRow key={m.id} $right={isMe}>
        {!isMe && (
          <Avatar
            src={firstOfGroup ? m.image || profileFallback : profileFallback}
            style={{ visibility: firstOfGroup ? "visible" : "hidden" }}
            alt=""
          />
        )}
        <MessageGroup $right={isMe}>
          {!isMe && firstOfGroup && <Sender>{m.name}</Sender>}
          <BubbleRow $right={isMe}>
            <Bubble $right={isMe}>{m.text}</Bubble>
            {showTime && <Time>{m.time}</Time>}
          </BubbleRow>
        </MessageGroup>
      </MessageRow>
    );
  };

  return (
    <Page>
      <ChatHeader>
        <HeaderButton onClick={() => navigate(-1)} aria-label="뒤로">
          <ChevronLeft size={28} />
        </HeaderButton>

        <HeaderTitleWrap>
          <Title>{title}</Title>
          {meetingActive && (
            <RoundIndicator>{`${currentRound}회차 진행중`}</RoundIndicator>
          )}
        </HeaderTitleWrap>

        <HeaderButton
          onClick={() => {
            fetchSessionStatus().finally(() => setSideOpen(true));
          }}
          aria-label="메뉴"
        >
          <MenuIcon size={22} />
        </HeaderButton>
      </ChatHeader>

      <ChatArea>
        <MessageList>{messages.map(renderMessage)}</MessageList>

        <InputBar>
          {hostExists ? (
            <>
              <TextInput
                placeholder="메세지를 입력해보세요!"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IconButton onClick={handleSend} title="전송">
                <SendIcon size={20} />
              </IconButton>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#000",
              }}
            >
              <AlertCircle size={18} />
              <div style={{ fontSize: 14 }}>종료된 채팅입니다</div>
            </div>
          )}
        </InputBar>
      </ChatArea>

      {/* 오른쪽 패널 */}
      {sideOpen && (
        <Overlay onClick={() => setSideOpen(false)}>
          <SidePanel onClick={(e) => e.stopPropagation()}>
            <HeaderButton
              style={{ alignSelf: "flex-end" }}
              onClick={() => setSideOpen(false)}
              aria-label="닫기"
            >
              <X size={22} />
            </HeaderButton>

            <SideTitle>참가 중인 사람</SideTitle>
            <SideScroll>
              {participants.map((p) => {
                const status = participantStatus[p.userId] ?? "불참";
                return (
                  <ParticipantRow key={p.userId}>
                    <ParticipantLeft>
                      <Avatar src={p.image || profileFallback} alt="" />
                      <PName>{p.name}</PName>
                    </ParticipantLeft>

                    {meetingActive && (
                      <StatusBadge>
                        <StatusDot style={{ color: "#ffd000" }}>
                          {status === "참여" ? "●" : "○"}
                        </StatusDot>
                        <span style={{ color: theme.colors.black }}>
                          {status}
                        </span>
                      </StatusBadge>
                    )}
                  </ParticipantRow>
                );
              })}
            </SideScroll>
            <SideButtonContainer>
              {myRole === "OWNER" && (
                <div>
                  {meetingActive ? (
                    <Button
                      title="모임종료"
                      onClick={() => setEndConfirmOpen(true)}
                      style={{
                        height: "40px",
                        width: "100%",
                        backgroundColor: theme.colors.lightBlue,
                      }}
                      textStyle={{
                        color: theme.colors.black,
                        fontSize: 16,
                        marginLeft: 0,
                      }}
                    />
                  ) : (
                    <Button
                      title="모임 주최"
                      onClick={() => {
                        setFormDate(getToday());
                        setFormTime(getNow());
                        setFormPrice("10000");
                        setFormLocation("");
                        setStartModalOpen(true);
                      }}
                      style={{
                        height: "40px",
                        width: "100%",
                      }}
                      textStyle={{
                        color: theme.colors.white,
                        fontSize: 16,
                        marginLeft: 0,
                      }}
                    />
                  )}
                </div>
              )}
            </SideButtonContainer>

            <DangerExit onClick={leaveRoom} aria-label="나가기">
              <LogOut size={22} color="#FF2E2E" />
            </DangerExit>
          </SidePanel>
        </Overlay>
      )}

      {/* 모임 시작 모달 (프로젝트의 공용 ChatModal을 그대로 사용한다고 가정) */}
      <ChatModal
        visible={startModalOpen}
        formDate={formDate}
        setFormDate={setFormDate}
        formTime={formTime}
        setFormTime={setFormTime}
        formPrice={formPrice}
        setFormPrice={setFormPrice}
        formLocation={formLocation}
        setFormLocation={setFormLocation}
        onConfirm={handleStartMeeting}
        onCancel={() => setStartModalOpen(false)}
      />

      {/* 종료 확인 모달 */}
      <AlertModal
        visible={endConfirmOpen}
        message="모임을 종료하시겠습니까?"
        onConfirm={handleEndMeeting}
        onCancel={() => setEndConfirmOpen(false)}
      />
    </Page>
  );
};

export default ChatPage;
