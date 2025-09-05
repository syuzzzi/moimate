import React, { useState, useCallback, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart } from "react-feather";
import api from "../api/api";
import EncryptedStorage from "localforage";
import { Button } from "../components";
import useSWR from "swr";
import MoonLoader from "react-spinners/MoonLoader";
import theme from "../theme.js";

// styled-components로 React Native 스타일 대체
const Container = styled.div`
  background-color: #fff;
  padding: 20px;
  margin-top: 20px;
`;

const SortContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: auto;
  justify-content: flex-end;
`;

const SortButton = styled.button`
  height: 25px;
  min-width: 60px;
  border-radius: 20px;
  background-color: #e9e9e9;
  margin-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.lightBlue : "#e9e9e9"};
  &:last-child {
    margin-right: 0;
  }
`;

// SortText 컴포넌트의 props를 활용하여 색상을 동적으로 변경합니다.
const SortText = styled.span`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.mainBlue : theme.colors.grey};
`;

const PostListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PostItem = styled(Link)`
  display: block;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  text-decoration: none;
  color: inherit;
`;

const PostTitle = styled.h3`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin: 0;
`;

const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
`;

const PostDate = styled.span`
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-top: 3px;
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LikesText = styled.span`
  margin-left: 5px;
  color: #979c9e;
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 999;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const EmptyList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  text-align: center;
  color: #888;
`;

const AllPosts = ({ route }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");
  const categoryName = queryParams.get("categoryName");

  const [meetings, setMeetings] = useState([]);
  const [selectedSort, setSelectedSort] = useState("latest");
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCurrentUserId(null);
        return;
      }
      const response = await api.get("/mypage/me", {
        headers: {
          access: `${token}`,
        },
      });
      setCurrentUserId(response.data.data);
    } catch (error) {
      console.error("유저 정보 가져오기 실패:", error);
      setCurrentUserId(null);
    }
  };

  const fetchMeetings = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasNextPage && !isInitial)) return;
      setLoading(true);

      try {
        const params = {
          sort: selectedSort === "popular" ? "likesCount" : "createdAt",
          size: 10,
        };

        if (category) params.category = category;
        if (!isInitial && cursor) params.cursor = cursor;

        const response = await api.get("/posts/list", { params });
        const newPosts = response.data.dtoList;

        if (newPosts.length > 0) {
          setMeetings((prev) =>
            isInitial ? newPosts : [...prev, ...newPosts]
          );
          setCursor(newPosts[newPosts.length - 1].postId);
          setHasNextPage(newPosts.length === 10);
        } else {
          setHasNextPage(false);
        }
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasNextPage, selectedSort, category, cursor]
  );

  useEffect(() => {
    fetchUserInfo();
    setMeetings([]);
    setCursor(null);
    setHasNextPage(true);
    fetchMeetings(true);
  }, [selectedSort, category]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      fetchMeetings();
    }
  };

  const renderPost = (item) => {
    const isMine = String(item.userId) === String(currentUserId);
    const screen = isMine ? "/mypostdetail" : "/postdetail";
    const postLink = `${screen}/${item.postId}`;

    return (
      <PostItem key={item.postId} to={postLink}>
        <PostTitle>{item.title}</PostTitle>
        <PostInfo>
          <PostDate>
            {item.createdAt?.split("T")[0].split("-").join(".")}
          </PostDate>
          <LikesContainer>
            <Heart size={16} color="#979c9e" />
            <LikesText>{item.likesCount}</LikesText>
          </LikesContainer>
        </PostInfo>
      </PostItem>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container onScroll={handleScroll}>
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontFamily: theme.fonts.extraBold,
              marginTop: "15px",
              marginBottom: "5px",
            }}
          >
            {categoryName ? `'${categoryName}' 카테고리 모임` : "전체 모임"}
          </h2>
          <span
            style={{
              fontSize: "14px",
              color: "#a1a1a1",
              marginTop: "10px",
              fontFamily: theme.fonts.bold,
            }}
          >
            총 {meetings.length}개의 모임이 있습니다
          </span>
        </div>

        <SortContainer>
          <SortButton
            onClick={() => setSelectedSort("latest")}
            $active={selectedSort === "latest"}
          >
            <SortText $active={selectedSort === "latest"}>최신순</SortText>
          </SortButton>

          <SortButton
            onClick={() => setSelectedSort("popular")}
            $active={selectedSort === "popular"}
          >
            <SortText $active={selectedSort === "popular"}>인기순</SortText>
          </SortButton>
        </SortContainer>

        {loading && meetings.length === 0 ? (
          <LoaderContainer>
            <MoonLoader size={20} color={theme.colors.mainBlue} />
          </LoaderContainer>
        ) : meetings.length === 0 ? (
          <EmptyList>
            <span>모아모아의 첫 모임을 생성해보세요!</span>
          </EmptyList>
        ) : (
          <PostListContainer>{meetings.map(renderPost)}</PostListContainer>
        )}

        {loading && meetings.length > 0 && (
          <LoaderContainer>
            <MoonLoader size={20} color={theme.colors.mainBlue} />
          </LoaderContainer>
        )}

        <ButtonContainer>
          <Button
            title="모임생성"
            onClick={() => navigate("/createpost")}
            style={{
              height: "40px",
              width: "95px",
            }}
            textStyle={{ fontSize: 16, fontFamily: theme.fonts.bold }}
          />
        </ButtonContainer>
      </Container>
    </ThemeProvider>
  );
};

export default AllPosts;
