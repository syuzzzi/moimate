import React, { useContext, useState, useMemo, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import api from "../api/api";

const Wrapper = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.white};
  position: relative;
  min-height: 100vh;
`;

const Container = styled.div`
  flex: 1;
  padding: 40px 30px 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MeetingDate = styled.h2`
  margin-top: 30px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.black};
  font-size: 24px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const RoundText = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const MessageText = styled.p`
  color: ${({ theme }) => theme.colors.grey};
  font-size: 18px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-bottom: 10px;
`;

const ParticipantListContainer = styled.div`
  width: 100%;
  margin-top: 40px;
  max-height: 300px;
  overflow-y: auto;
`;

const ParticipantList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconBox = styled.button`
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
`;

const AvatarBox = styled.div`
  width: 48px;
  display: flex;
  justify-content: center;
`;

const ParticipantRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ParticipantImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin: 0 12px;
  background-color: #ccc;
`;

const ParticipantName = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const FooterContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 30px;
  right: 30px;
`;

const EmptyText = styled.p`
  position: absolute;
  top: 55%;
  font-size: 16px;
  color: #a1a1a1;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const CheckParticipantsPage = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    participants = [],
    participantStatus = {},
    currentRound,
    sessionDate,
    roomId,
    sessionId,
  } = location.state ?? {};

  const paidParticipants = useMemo(() => {
    return participants.filter((p) => participantStatus[p.userId] === "참여");
  }, [participants, participantStatus]);

  const [Status, setStatus] = useState(() =>
    paidParticipants.map((p) => ({ ...p, attended: false }))
  );

  const toggleCheck = (index) => {
    const updated = [...Status];
    updated[index].attended = !updated[index].attended;
    setStatus(updated);
  };

  const checkedParticipants = useMemo(
    () => Status.filter((p) => p.attended),
    [Status]
  );

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const refundTargets = checkedParticipants;

      if (refundTargets.length > 0) {
        await Promise.all(
          refundTargets.map(async (p) => {
            const refundInfoResponse = await api.post(
              "/payments/info",
              {
                userId: p.userId,
                sessionId,
                somoimId: roomId,
              },
              { headers: { access: token } }
            );

            const { amount, impUid } = refundInfoResponse.data.data;
            return api.post(
              "/payments/refund",
              { amount, impUid },
              { headers: { access: token } }
            );
          })
        );
      }

      await api.post(
        "/sessions/end",
        { roomId, sessionId },
        { headers: { access: token } }
      );

      navigate(-1);
    } catch (e) {
      console.error("세션 종료 처리 실패:", e.response?.data ?? e.message);
    }
  };

  return (
    <Wrapper>
      <Container>
        <MeetingDate>{sessionDate || "날짜 정보 없음"}</MeetingDate>
        <MessageText>
          <RoundText>{currentRound}회차</RoundText> 모임이 종료되었습니다!
        </MessageText>

        {paidParticipants.length === 0 ? (
          <EmptyText>결제한 사람이 없습니다.</EmptyText>
        ) : (
          <>
            <MessageText>모임에 참여한 사람을 선택해 주세요.</MessageText>
            <ParticipantListContainer>
              <ParticipantList>
                {paidParticipants.map((p, i) => (
                  <ParticipantRow key={p.userId}>
                    <IconBox onClick={() => toggleCheck(i)}>
                      {Status[i].attended ? (
                        <ImCheckboxChecked />
                      ) : (
                        <ImCheckboxUnchecked />
                      )}
                    </IconBox>
                    <AvatarBox>
                      <ParticipantImage
                        src={
                          p.image ||
                          "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
                        }
                        alt={p.name}
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
        <button
          style={{
            width: "100%",
            height: "50px",
            backgroundColor: theme.colors.mainBlue,
            color: "white",
            fontFamily: theme.fonts.bold,
            fontSize: "16px",
          }}
          onClick={handleSubmit}
        >
          확인
        </button>
      </FooterContainer>
    </Wrapper>
  );
};

export default CheckParticipantsPage;
