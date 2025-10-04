import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckSquare, Square, LogOut } from "react-feather";
import { v4 as uuid } from "uuid"; // uuid는 예시로 추가, 실제 구현에 따라 필요 없을 수도 있습니다.

import api from "../api/api";
import { Button, AlertModal } from "../components";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 120px;
`;

const Container = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 30px 0;
  max-width: 600px;
  margin: 0 auto;
`;

const HeaderTitle = styled.h1`
  margin-top: 30px;
  margin-bottom: 20px;
  color: #000;
  font-size: 28px;
  font-weight: bold;
`;

const RoundText = styled.span`
  font-weight: bold;
`;

const MessageText = styled.p`
  color: #888;
  font-size: 18px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  line-height: 1.4;
  margin-top: 0;
`;

const ParticipantListContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding-top: 20px;
`;

const ParticipantList = styled.div`
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

const IconBox = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  & > svg {
    font-size: 24px; /* 아이콘 크기를 적절히 조정 */
    /* 체크 상태에 따라 색상 조정 */
    color: ${({ theme, $checked }) =>
      $checked ? theme.colors.mainBlue : "#ccc"};
  }
`;

const AvatarBox = styled.div`
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ParticipantRow = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

const ParticipantImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #ccc;
  margin: 0 0 0 0;
`;

const ParticipantName = styled.span`
  font-size: 16px;
  font-weight: bold;
  flex: 1;
`;

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 30px;
  background-color: #fff;
  border-top: 1px solid #eee;
  z-index: 10;
  display: flex;
  justify-content: center;
`;

const EmptyText = styled.p`
  margin-top: 80px;
  font-size: 16px;
  color: #a1a1a1;
  text-align: center;
`;

const CheckParticipants = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    participants,
    participantStatus,
    currentRound,
    sessionDate,
    roomId,
    sessionId,
  } = location.state ?? {};

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const profileFallback =
    "https://ssl.pstatic.net/static/pwe/address/img_profile.png";

  const paidParticipants = useMemo(() => {
    return (participants || []).filter(
      (p) => participantStatus?.[p.userId] === "참여"
    );
  }, [participants, participantStatus]);

  const [Status, setStatus] = useState(() =>
    paidParticipants.map((p) => ({ ...p, attended: false, key: uuid() }))
  );

  useEffect(() => {
    setStatus(
      paidParticipants.map((p) => ({ ...p, attended: false, key: uuid() }))
    );
  }, [paidParticipants]);

  const toggleCheck = useCallback((userId) => {
    setStatus((prevStatus) =>
      prevStatus.map((p) =>
        p.userId === userId ? { ...p, attended: !p.attended } : p
      )
    );
  }, []);

  // 모임에 '참여하지 않은' 사람, 즉 '환불 대상자' 목록
  const refundTargets = useMemo(() => {
    // 체크가 안된 (attended: false) 사람이 환불 대상자입니다.
    // 기존 RN 코드는 '참여한 사람을 선택'하고 그 목록(checkedParticipants)을 환불 대상으로 사용했지만,
    // 이는 로직상 '모임에 참석한 사람 = 결제 유지'로 보아,
    // 여기서는 *체크된 사람은 결제 유지* / *체크 안된 사람을 환불 대상*으로 가정하고 로직을 수정하는 것이 더 자연스러워 보입니다.
    return Status.filter((p) => p.attended);
  }, [Status]);

  useEffect(() => {
    console.log("환불 대상자 목록:");
    if (refundTargets.length > 0) {
      refundTargets.forEach((p) => {
        console.log(
          `- 환불 대상 (체크됨): 이름: ${p.name}, userId: ${p.userId}`
        );
      });
    } else {
      console.log("환불 대상자가 없습니다.");
    }
  }, [refundTargets]);

  const handleSubmit = async () => {
    if (!roomId || !sessionId) {
      setErrorModalMessage("세션 정보가 누락되었습니다.");
      setErrorModalVisible(true);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      console.log(
        "최종 환불 대상자:",
        refundTargets.map((p) => p.name)
      );

      // 1. 환불 대상자에 대한 환불 처리
      if (refundTargets.length > 0) {
        await Promise.all(
          refundTargets.map(async (p) => {
            // 1-1. 불참자의 결제 정보(impUid, amount)를 가져오는 API 호출
            const refundInfoResponse = await api.post(
              "/payments/info",
              {
                userId: p.userId,
                sessionId: currentRound,
                somoimId: roomId,
              },
              {
                headers: { access: token, "Content-Type": "application/json" },
              }
            );

            const { amount, impUid } = refundInfoResponse.data.data;
            console.log(
              `- ${p.name}의 환불 정보: amount=${amount}, impUid=${impUid}`
            );

            // 1-2. 가져온 환불 정보를 포함하여 환불 API 호출
            return api.post(
              "/payments/refund",
              {
                amount,
                impUid,
              },
              {
                headers: { access: token, "Content-Type": "application/json" },
              }
            );
          })
        );
      }

      // 2. 모든 환불 처리가 완료된 후에 모임 종료 API를 호출합니다.
      await api.post(
        "/sessions/end",
        { roomId, sessionId },
        {
          headers: { access: token, "Content-Type": "application/json" },
        }
      );

      console.log("모든 환불 처리와 세션 종료가 완료되었습니다.");

      setModalMessage("참가자들에 대한\n환불 처리가 완료 되었습니다");
      setModalVisible(true);
    } catch (e) {
      console.error("세션 종료 처리 실패:", e.response?.data ?? e.message);

      setErrorModalMessage(
        `세션 종료 처리 중 오류가 발생했습니다.\n${
          e.response?.data?.message || e.message
        }`
      );
      setErrorModalVisible(true);
    }
  };

  return (
    <PageWrapper>
      <Container>
        {/* 헤더 역할 (뒤로가기 등)은 생략하고 내용만 구성 */}
        <HeaderTitle>{sessionDate || "날짜 정보 없음"}</HeaderTitle>
        <MessageText>
          <RoundText>{currentRound}회차</RoundText> 모임이 종료되었습니다!
        </MessageText>

        {paidParticipants.length === 0 ? (
          <EmptyText>결제한 사람이 없습니다.</EmptyText>
        ) : (
          <>
            <MessageText>
              모임에{" "}
              <span
                style={{
                  color: theme.colors.mainBlue,
                  fontSize: 20,
                }}
              >
                참여한 사람
              </span>
              을 선택해 주세요.
            </MessageText>
            <ParticipantListContainer>
              <ParticipantList>
                {Status.map((p) => (
                  <ParticipantRow key={p.key}>
                    <IconBox
                      onClick={() => toggleCheck(p.userId)}
                      type="button"
                      aria-label={`환불 대상 선택: ${p.name}`}
                      $checked={p.attended}
                    >
                      {p.attended ? (
                        <ImCheckboxChecked />
                      ) : (
                        <ImCheckboxUnchecked />
                      )}
                    </IconBox>
                    <AvatarBox>
                      <ParticipantImage
                        src={p.image || profileFallback}
                        alt={`${p.name} 프로필`}
                      />
                    </AvatarBox>
                    <ParticipantName>{p.name}</ParticipantName>
                  </ParticipantRow>
                ))}
              </ParticipantList>
            </ParticipantListContainer>
          </>
        )}
      </Container>

      <FooterContainer>
        <Button
          title="환불"
          onClick={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 500,
            backgroundColor: theme.colors.mainBlue,
            height: 50,
          }}
          textStyle={{ color: theme.colors.white, fontWeight: "bold" }}
        />
      </FooterContainer>

      {/* 완료 모달 */}
      <AlertModal
        visible={modalVisible}
        message={modalMessage}
        onConfirm={() => {
          setModalVisible(false);
          // 완료 후 이전 화면으로 돌아가거나 메인 화면으로 이동
          navigate(-1);
        }}
      />

      {/* 오류 모달 */}
      <AlertModal
        visible={errorModalVisible}
        message={errorModalMessage}
        onConfirm={() => {
          setErrorModalVisible(false);
        }}
        onCancel={() => {
          setErrorModalVisible(false);
        }}
      />
    </PageWrapper>
  );
};

export default CheckParticipants;
