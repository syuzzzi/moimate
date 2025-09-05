import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import theme from "../theme.js";
import { Heart, Search } from "react-feather";
import api from "../api/api";
import Logo from "../../assets/logo.svg";
import useSWR from "swr";

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-top: 20px;
  margin-bottom: 5px;
  color: #656565;
`;

const ViewAllButton = styled(Link)`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-left: auto;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.mainBlue};
`;

const PostListContainer = styled.div`
  min-height: 150px;
`;

const ListItem = styled(Link)`
  display: block;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
  text-decoration: none;
  color: inherit;
`;

const ListTitle = styled.h3`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 3px;
`;

const ListInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const ListDate = styled.span`
  color: #888;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const LikesText = styled.span`
  margin-left: 5px;
  font-size: 14px;
  color: #979c9e;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const CategoryContainer = styled.div`
  margin-top: 30px;
  margin-bottom: 10px;
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
  -webkit-overflow-scrolling: touch;
`;

const CategoryItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 25px;
  text-decoration: none;
  color: inherit;
  min-width: 50px;
  text-align: center;
`;

const CategoryImage = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const CategoryText = styled.span`
  margin-top: 10px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.grey};
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.mainBlue};
  border-radius: 10px;
  padding: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const EmptyList = styled.div`
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  padding-bottom: 10px;
`;

const EmptyText = styled.span`
  font-size: 16px;
  color: #888;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 5px; /* 스크롤바 공간을 위한 패딩 */
`;

const fixedContentStyle = {
  flexShrink: 0,
};

const dummyMeetings = [
  {
    postId: 101,
    title: "강남역 맛집 탐방 모임",
    createdAt: "2025-09-02T10:00:00Z",
    likesCount: 15,
    userId: 1,
  },
  {
    postId: 102,
    title: "한강 러닝 크루 모집",
    createdAt: "2025-09-01T15:30:00Z",
    likesCount: 22,
    userId: 2,
  },
  {
    postId: 103,
    title: "코딩 스터디 멤버 구해요 (React)",
    createdAt: "2025-08-30T18:45:00Z",
    likesCount: 8,
    userId: 3,
  },
]; //더미데이터

const Section = ({ title, showViewAll, onViewAllPress, children }) => (
  <SectionContainer>
    <SectionHeader>
      <SectionTitle>{title}</SectionTitle>
      {showViewAll && (
        <ViewAllButton to={onViewAllPress}>전체글 &gt;</ViewAllButton>
      )}
    </SectionHeader>
    <div>{children}</div>
  </SectionContainer>
);

const PostList = ({ data, currentUserId }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyList>
        <EmptyText>모아모아의 첫 모임을 생성해보세요!</EmptyText>
      </EmptyList>
    );
  }

  return (
    <PostListContainer>
      {data.map((item) => {
        const screen =
          currentUserId && String(item.userId) === String(currentUserId)
            ? "/mypostdetail"
            : "/postdetail";
        const postLink = `${screen}/${item.postId}`;
        return (
          <ListItem key={item.postId} to={postLink}>
            <ListTitle>{item.title}</ListTitle>
            <ListInfo>
              <ListDate>
                {item.createdAt?.split("T")[0].split("-").join(".")}
              </ListDate>
              <LikesContainer>
                <Heart size={16} color="#979c9e" />
                <LikesText>{item.likesCount}</LikesText>
              </LikesContainer>
            </ListInfo>
          </ListItem>
        );
      })}
    </PostListContainer>
  );
};

// Main component
const MainPage = () => {
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState(null);

  const fetcher = (url) => api.get(url).then((res) => res.data.dtoList);

  /* const { data: latestMeetings = [], isLoading: isLoadingLatest } = useSWR(
    "/posts/list?sort=createdAt&size=3",
    fetcher
  );
  const { data: popularMeetings = [], isLoading: isLoadingPopular } = useSWR(
    "/posts/list?sort=likesCount&size=3",
    fetcher
  );*/
  const [latestMeetings, setLatestMeetings] = useState([]);
  const [popularMeetings, setPopularMeetings] = useState([]); //더미데이터 삭제시 제거

  // Use useEffect for initial data fetching and side effects
  useEffect(() => {
    setLatestMeetings(dummyMeetings); // 더미데이터 삭제시 제거
    setPopularMeetings(dummyMeetings); // 더미데이터 삭제시 제거
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await api.get("/mypage/me", {
            headers: {
              access: `${token}`,
            },
          });
          setCurrentUserId(response.data.data);
        }
      } catch (error) {
        console.log("유저 정보 가져오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const category = [
    {
      id: "1",
      name: "취미",
      code: "HOBBY",
      image: "../../assets/icons/categoriHobby.png",
    },
    {
      id: "2",
      name: "운동",
      code: "EXERCISE",
      image: "../../assets/icons/categoriExercise.png",
    },
    {
      id: "3",
      name: "또래",
      code: "FRIEND",
      image: "../../assets/icons/categoriFriend.png",
    },
    {
      id: "4",
      name: "공부",
      code: "STUDY",
      image: "../../assets/icons/categoriStudy.png",
    },
    {
      id: "5",
      name: "음악",
      code: "MUSIC",
      image: "../../assets/icons/categoriMusic.png",
    },
    {
      id: "6",
      name: "게임",
      code: "GAME",
      image: "../../assets/icons/categoriGame.png",
    },
  ];
  /*
  if (isLoadingLatest || isLoadingPopular) {
    return <div>Loading...</div>; // You can add a more sophisticated loader here
  }*/

  return (
    <PageContainer>
      <div style={fixedContentStyle}>
        <LogoContainer>
          <img src={Logo} alt="logo" width={180} height={50} />
        </LogoContainer>

        {/* 검색창 */}
        <Link to="/search" style={{ textDecoration: "none" }}>
          <SearchContainer theme={theme}>
            <SearchInput type="text" placeholder="검색" readOnly />
            <Search size={26} color={theme.colors.mainBlue} />
          </SearchContainer>
        </Link>

        {/* 카테고리 */}
        <CategoryContainer>
          {category.map((item) => (
            <CategoryItem
              key={item.id}
              to={`/allposts?category=${item.code}&categoryName=${item.name}`}
            >
              <CategoryImage src={item.image} alt={item.name} />
              <CategoryText theme={theme}>{item.name}</CategoryText>
            </CategoryItem>
          ))}
        </CategoryContainer>
      </div>

      <ScrollableContent>
        <Section
          title="최신 모임"
          showViewAll
          onViewAllPress="/allposts?sort=createdAt"
        >
          <PostList data={latestMeetings} currentUserId={currentUserId} />
        </Section>

        <Section title="주간 TOP3 모임">
          <PostList data={popularMeetings} currentUserId={currentUserId} />
        </Section>
      </ScrollableContent>
    </PageContainer>
  );
};

export default MainPage;
