import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { ThemeContext } from "styled-components";
import {
  FiHeart,
  FiDollarSign,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { ChevronLeft } from "react-feather";
import api from "../api/api";
import Button from "../components/Button";

// Styled-components
const Container = styled.div`
  flex: 1;
  padding: 20px;
  padding-top: 15px;
  background-color: #fff;
`;
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: -10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Section = styled.div`
  min-height: 50px;
  margin-bottom: 5px;
`;
const Title = styled.h1`
  font-size: 24px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-top: 20px;
`;
const DateText = styled.p`
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  margin-top: -20px;
`;
const Content = styled.p`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regular};
  line-height: 30px;
  margin-top: 20px;
  margin-bottom: 20px;
`;
const Info = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;
const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.grey};
  margin-top: 15px;
`;
const RowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;
const Label = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.grey};
  margin: 0 5px;
`;
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-right: 10px;
  cursor: pointer;
`;
const ProfileHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;
const ProfileImageContainer = styled.div`
  width: 50px;
  height: 50px;
  margin-right: 10px;
  border-radius: 30px;
  background-color: #ddd;
  overflow: hidden;
`;
const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 25px;
`;
const ProfileName = styled.span`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: #000;
`;
const ProfileIntro = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: #444;
  line-height: 22px;
  margin-left: 10px;
  margin-top: 15px;
`;
const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px 10px 70px 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const LikeButton = styled.button`
  display: flex;
  align-items: center;
  margin-left: 5px;
  background: none;
  border: none;
  cursor: pointer;
`;
const LikeText = styled.span`
  margin-left: 5px;
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ $liked, theme }) => ($liked ? "#FF6B6B" : theme.colors.grey)};
`;

const PostDetailPage = () => {
  const theme = useContext(ThemeContext);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [user, setUser] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  // ✅ 더미데이터
  const dummyMeeting = {
    postId: postId || "1",
    title: "React 스터디 모집",
    createdAt: "2025.09.05",
    content:
      "React와 styled-components를 활용한 웹 개발 스터디원을 모집합니다!\n어쩌꾸어너ㅓ얼ㄴ러ㅏ\n어ㅓ라어러ㅏ어라어\n어라온ㅇ뢰ㅏㄴㅇ",
    location: "서울 강남구",
    maxParticipants: 10,
    recruitmentStart: "2025-09-01",
    recruitmentEnd: "2025-09-15",
    activityStart: "2025-09-20",
    activityEnd: "2025-10-30",
    deposit: 50000,
    tags: ["#스터디", "#React"],
    likes: 7,
  };

  const dummyUser = {
    userId: "u123",
    name: "홍길동",
    career: "프론트엔드 개발자 · 3년차",
    image: null,
  };

  const fetchDetail = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = accessToken ? { access: accessToken } : {};
      const res = await api.get(`/posts/${postId}`, { headers });
      const data = res.data.data;

      setMeeting({
        postId: data.id,
        title: data.title,
        createdAt: data.createdAt.split("T")[0].replace(/-/g, "."),
        content: data.content,
        location: data.location,
        maxParticipants: data.membersMax,
        recruitmentStart: data.createdAt.split("T")[0],
        recruitmentEnd: data.dueDate,
        activityStart: data.activityStartDate,
        activityEnd: data.activityEndDate,
        deposit: data.warranty,
        tags: [`#${data.category}`],
        likes: data.likesCount,
      });
      setUser({
        userId: data.userId,
        name: data.userName,
        career: data.userCareer,
        image: data.userImage,
      });
      setLikes(data.likesCount);
      setLiked(data.liked ?? false);
      setIsApplied(!!data.formId);
    } catch (e) {
      console.error("상세 데이터 로딩 실패", e);
    }
  };

  useEffect(() => {
    // ✅ 더미데이터 주입
    setMeeting(dummyMeeting);
    setUser(dummyUser);
    setLikes(dummyMeeting.likes);
    setLiked(false);
    setIsApplied(false);
    //fetchDetail();
  }, [postId]);

  const toggleLike = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (!liked) {
        const res = await api.post(
          `/posts/${postId}/likes`,
          {},
          { headers: { access: accessToken } }
        );
        if (res.status === 201) {
          setLiked(true);
          setLikes((prev) => prev + 1);
        }
      } else {
        const res = await api.delete(`/posts/${postId}/likes`, {
          headers: { access: accessToken },
        });
        if (res.status === 200) {
          setLiked(false);
          setLikes((prev) => prev - 1);
        }
      }
    } catch (err) {
      console.error("좋아요 처리 오류", err);
    }
  };

  if (!meeting || !user) return <p>불러오는 중...</p>;

  const recruitmentDeadline = new Date(`${meeting.recruitmentEnd}T23:59:59`);
  const isRecruitmentClosed = recruitmentDeadline < new Date();

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
      </HeaderContainer>
      <Section>
        <RowContainer style={{ justifyContent: "space-between" }}>
          <Title>{meeting.title}</Title>
        </RowContainer>
        <DateText>{meeting.createdAt}</DateText>
        <Content>{meeting.content}</Content>

        <RowContainer>
          <FiMapPin size={20} color={theme.colors.grey} />
          <Label>지역</Label>
          <Info>{meeting.location}</Info>
        </RowContainer>

        <RowContainer>
          <FiUsers size={20} color={theme.colors.grey} />
          <Label>모집인원</Label>
          <Info>{meeting.maxParticipants}</Info>
        </RowContainer>

        <RowContainer>
          <FiCalendar size={20} color={theme.colors.grey} />
          <Label>모집기간</Label>
          <Info>
            {meeting.recruitmentStart} ~ {meeting.recruitmentEnd}
          </Info>
        </RowContainer>

        <RowContainer>
          <FiClock size={20} color={theme.colors.grey} />
          <Label>활동기간</Label>
          <Info>
            {meeting.activityStart} ~ {meeting.activityEnd}
          </Info>
        </RowContainer>

        <RowContainer>
          <FiDollarSign size={20} color={theme.colors.grey} />
          <Label>보증금</Label>
          <Info>{meeting.deposit}</Info>
        </RowContainer>

        <Info style={{ color: "#3386CA", marginTop: 10 }}>
          {meeting.tags.join("  ")}
        </Info>

        <Divider />
      </Section>

      <ProfileContainer
        onClick={() => navigate(`/publicprofile/${user.userId}`)}
      >
        <ProfileHeader>
          <ProfileImageContainer>
            <ProfileImage
              src={
                user?.image ||
                "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
              }
            />
          </ProfileImageContainer>
          <RowContainer>
            <Label>작성자</Label>
            <ProfileName>{user.name}</ProfileName>
          </RowContainer>
        </ProfileHeader>
        <ProfileIntro>{user.career}</ProfileIntro>
      </ProfileContainer>

      <Footer>
        <LikeButton onClick={toggleLike}>
          {liked ? (
            <AiFillHeart size={28} color="#FF6B6B" />
          ) : (
            <FiHeart size={28} color={theme.colors.grey} />
          )}
          <LikeText $liked={liked}>{likes}</LikeText>
        </LikeButton>
        <Button
          title={
            isRecruitmentClosed
              ? "모집마감"
              : isApplied
              ? "신청완료"
              : "신청하기"
          }
          onClick={() => {
            if (!isRecruitmentClosed && !isApplied) {
              navigate(`/apply/${postId}`);
            }
          }}
          disabled={isRecruitmentClosed || isApplied}
          style={{
            height: 50,
            width: 280,

            cursor:
              isRecruitmentClosed || isApplied ? "not-allowed" : "pointer",
          }}
        ></Button>
      </Footer>
    </Container>
  );
};

export default PostDetailPage;
