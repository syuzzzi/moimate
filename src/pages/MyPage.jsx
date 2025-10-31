import React, { useState, useCallback, useEffect } from "react";
import styled, { useTheme, keyframes } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "react-feather";
import { FaStar, FaSpinner } from "react-icons/fa";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
  padding-top: 0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 0px;
  padding-bottom: 50px; /* 버튼 때문에 여백 확보 */
`;

const MyPageSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 20px;
  padding-bottom: 10px;
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
  margin-left: 6px;
  margin-bottom: 10px;
  min-height: 180px;

  flex-direction: column;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  padding-top: ${({ $addTopPadding }) => ($addTopPadding ? "20px" : "10px")};
  color: #656565;
  padding-bottom: 0;
  margin: 0;
`;

const MeetingItem = styled(Link)`
  padding-top: -10px;

  margin: 0;
  text-decoration: none;
  color: inherit;
  display: block;
`;

const MeetingTitle = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-bottom: 7px;
`;

const MeetingDate = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
  margin-bottom: 3px;
  margin-top: 7px;
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
  display: flex;
  flex-direction: column; /* 아이콘과 텍스트가 세로로 정렬되도록 */
  justify-content: center;
  align-items: center;
  height: 90vh; /* 전체 화면을 채우도록 */
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

const MyPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // 사용자 정보 및 모임 데이터 상태
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 🐛 무한 로딩 문제 해결: useCallback 적용 🐛
  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("토큰 없음");

      const userInfoRes = await api.get("/mypage/me", {
        headers: { access: token },
      });

      const userId = userInfoRes.data.data;
      setCurrentUserId(userId);

      const profileRes = await api.get("/mypage/full", {
        headers: { access: token },
      });

      const resData = profileRes.data.data;

      console.log("마이페이지 데이터:", resData);

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
            resData.appliedPosts?.map((post) => ({
              ...post,
              postId: post.postId,
              createdAt: formatDate(post.createdAt),
              userId: post.userId,
            })) || [],
        },
        {
          title: "좋아요 누른 모임",
          data:
            resData.likedPosts?.map((post) => ({
              ...post,
              postId: post.postId,
              createdAt: formatDate(post.createdAt),
              userId: myPostIds.includes(post.id) ? userId : post.userId,
            })) || [],
        },
        {
          title: "내가 만든 모임",
          data:
            resData.createdPosts?.map((post) => {
              // postId가 없는 경우를 대비해 post.id를 사용
              return {
                ...post,
                postId: post.postId,
                createdAt: formatDate(post.createdAt),
                userId: userId,
              };
            }) || [],
        },
      ]);
      setHasNextPage(false);
      setCursor(null);
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
  }, []); // **의존성 배열을 비워 최초 렌더링 시 한 번만 함수가 생성되도록 합니다.**

  useEffect(() => {
    load();
  }, [load]); // **load가 변경되지 않으므로 useEffect는 마운트 시 한 번만 실행됩니다.**

  const handleScroll = useCallback(
    (e) => {
      const target = e.target;
      const scrollHeight = target.scrollHeight;
      const scrollTop = target.scrollTop;
      const clientHeight = target.clientHeight;

      if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        hasNextPage &&
        !loading
      ) {
      }
    },
    [loading, hasNextPage]
  );

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingIcon>
          <FaSpinner />
        </LoadingIcon>
        <p>데이터를 불러오는 중입니다...</p>
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
              <FaStar
                size={18}
                color="#FFC107"
                style={{ marginRight: "5px" }}
              />
              <StarText>{user?.totalStar?.toFixed(1) || 0.0}</StarText>
            </StarContainer>
          </UserRow>
        </UserInfo>

        <Link to={`/profile/${currentUserId}`}>
          <ChevronRight size={24} color="#999" />
        </Link>
      </MyPageSection>

      <ScrollableContent onScroll={handleScroll}>
        {/* 모임 리스트 */}
        {meetings.map((section, index) => {
          const shouldAddPadding = section.title !== "신청한 모임";
          return (
            <Section key={section.title}>
              <SectionTitle $addTopPadding={shouldAddPadding}>
                {section.title}
              </SectionTitle>
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
                          meeting.userId === currentUserId
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
          );
        })}
      </ScrollableContent>
    </Container>
  );
};

export default MyPage;
