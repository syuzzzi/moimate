import React, { useState, useCallback, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { Star, ChevronRight } from "react-feather"; // ChevronRight를 직접 import
import api from "../api/api";
import EncryptedStorage from "localforage";
import { jwtDecode } from "jwt-decode";

// 스타일 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 20px;
  padding-top: 0;
`;

const MyPageSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-left: 10px;
  margin-right: 15px;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const UserRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const UserName = styled.p`
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${(props) => props.theme.colors.mainBlue};
  margin: 0;
`;

const StarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 15px;
`;

const StarText = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.mainBlue};
  margin-left: 7px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin: 0;
`;

const Section = styled.div`
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 15px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-bottom: 10px;
  color: #656565;
`;

const MeetingItem = styled(Link)`
  padding: 8px 0;
  text-decoration: none;
  color: inherit;
  display: block;
`;

const MeetingTitle = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin: 0;
`;

const MeetingDate = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-top: 4px;
  margin: 0;
`;

const PlaceholderWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 130px;
`;

const Placeholder = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
  text-align: center;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MyPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // 사용자 정보 및 모임 데이터 상태
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const load = async () => {
    try {
      const token = await EncryptedStorage.getItem("accessToken");
      if (!token) throw new Error("토큰 없음");

      const userInfoRes = await api.get("/mypage/me", {
        headers: { access: token },
      });

      const userId = userInfoRes.data.data;
      setCurrentUserId({ userId });

      const profileRes = await api.get("/mypage/full", {
        headers: { access: token },
      });

      const resData = profileRes.data.data;
      const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return `${date.getFullYear()}.${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
      };
      const myPostIds = resData.createdPosts?.map((post) => post.id) || [];

      setUser({
        name: resData.name,
        totalStar: resData.ratingAverage,
        image: resData.image,
      });

      setMeetings([
        {
          title: "신청한 모임",
          data:
            resData.joinedPosts?.map((post) => ({
              ...post,
              postId: post.id,
              createdAt: formatDate(post.createdAt),
              userId: post.userId,
            })) || [],
        },
        {
          title: "좋아요 누른 모임",
          data:
            resData.likedPosts?.map((post) => ({
              ...post,
              postId: post.id,
              createdAt: formatDate(post.createdAt),
              userId: myPostIds.includes(post.id) ? userId : post.userId,
            })) || [],
        },
        {
          title: "내가 만든 모임",
          data:
            resData.createdPosts?.map((post) => ({
              ...post,
              postId: post.id,
              createdAt: formatDate(post.createdAt),
              userId: userId,
            })) || [],
        },
      ]);
    } catch (e) {
      console.warn("📛 마이페이지 정보 로딩 실패:", e);
      setUser({ name: "사용자", totalStar: 0 });
      setMeetings([
        { title: "신청한 모임", data: [] },
        { title: "좋아요 누른 모임", data: [] },
        { title: "내가 만든 모임", data: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <p>로딩 중...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* 프로필 영역 */}
      <MyPageSection>
        <ProfileImage
          src={
            user?.image ||
            "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
          }
          alt="프로필 이미지"
        />
        <UserInfo>
          <UserRow>
            <UserName>{user?.name || "사용자"}</UserName>
            <StarContainer>
              <Star size={18} color="#FFC107" style={{ marginRight: "5px" }} />
              <StarText>{user?.totalStar?.toFixed(1) || 0.0}</StarText>
            </StarContainer>
          </UserRow>
        </UserInfo>

        <Link to="/profile">
          <ChevronRight size={24} color="#999" />
        </Link>
      </MyPageSection>

      {/* 모임 리스트 */}
      {meetings.map((section) => (
        <Section key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.data.length === 0 ? (
            <PlaceholderWrapper>
              <Placeholder>모임이 없습니다</Placeholder>
            </PlaceholderWrapper>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {section.data.map((meeting) => (
                <li key={`${meeting.postId}-${meeting.title}`}>
                  <MeetingItem
                    to={
                      meeting.userId === currentUserId.userId
                        ? `/mypostdetail/${meeting.postId}`
                        : `/postdetail/${meeting.postId}`
                    }
                  >
                    <MeetingTitle>{meeting.title}</MeetingTitle>
                    <MeetingDate>{meeting.createdAt}</MeetingDate>
                  </MeetingItem>
                </li>
              ))}
            </ul>
          )}
        </Section>
      ))}
    </Container>
  );
};

export default MyPage;
