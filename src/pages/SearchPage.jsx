import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { Search as SearchIcon } from "react-feather";
import api from "../api/api";
import { AlertModal } from "../components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 20px 20px 0 20px;
`;

const SearchBox = styled.div`
  display: flex;
  flex-direction: row;
  height: 45px;
  border: 2px solid;
  border-color: ${({ theme }) => theme.colors.mainBlue};
  border-radius: 10px;
  padding: 8px 12px;
  align-items: center;
  gap: 10px;
`;

const StyledInput = styled.input`
  flex: 1;
  font-size: 16px;
  border: none;
  outline: none;
  background-color: transparent;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const PlaceholderContainer = styled.div`
  margin-top: 30px;
  margin-left: 5px;
  justify-content: flex-start;
`;

const PlaceholderText = styled.p`
  text-align: left;
  color: #8c8c8c;
  font-size: 16px;
  line-height: 22px;
  white-space: pre-wrap; /* \n을 적용하기 위해 추가 */
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const ExampleText = styled.p`
  text-align: left;
  margin-top: 10px;
  color: #c0c0c0;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const ResultTitle = styled.h2`
  margin-top: 30px;
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-bottom: 15px;
`;

const ResultList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResultItem = styled(Link)`
  display: block;
  margin-top: 20px;
  text-decoration: none;
  color: inherit;
`;

const ResultText = styled.p`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 17px;
  margin: 0;
`;

const ResultDate = styled.p`
  margin-top: 3px;
  font-size: 14px;
  color: #999;
  margin: 0;
`;

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();

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
      console.error("유저 정보 가져오기 실패:", error);
    }
  };
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    // Keyboard.dismiss()는 웹에서 필요 없으므로 제거
    const trimmedQuery = query.trim();
    if (trimmedQuery === "") {
      setResults([]);
      return;
    }

    try {
      const response = await api.get("/posts/search", {
        params: { keyword: trimmedQuery },
      });

      const dtoList = response.data.dtoList || [];
      setResults(dtoList);
    } catch (error) {
      console.error("❌ 검색 실패:", error);
      setAlertMessage("검색 실패. 다시 시도해주세요.");
      setAlertVisible(true);
      setResults([]);
    }
  };

  // useFocusEffect 대신 useEffect를 사용하고, query가 변경될 때마다 결과를 초기화
  useEffect(() => {
    if (query === "") {
      setResults([]);
    }
  }, [query]);

  return (
    <Container>
      <form onSubmit={handleSearch}>
        <SearchBox>
          <StyledInput
            type="text"
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // onSubmitEditing은 웹에서 form의 onSubmit으로 대체
          />
          <SearchButton type="submit">
            <SearchIcon size={26} color={theme.colors.mainBlue} />
          </SearchButton>
        </SearchBox>
      </form>

      {query === "" ? (
        <PlaceholderContainer>
          <PlaceholderText>
            {"#태그를 입력하거나\n원하는 키워드를 검색해보세요!"}
          </PlaceholderText>
          <ExampleText>ex) #취미, 종로구, 맛집, 뜨개질</ExampleText>
        </PlaceholderContainer>
      ) : (
        <>
          <ResultTitle>'{query}' 검색 결과</ResultTitle>

          <div style={{ paddingBottom: 100, overflowY: "auto" }}>
            {results.length > 0 ? (
              <ResultList>
                {results.map((item) => (
                  <ResultItem
                    key={item.postId}
                    to={`/postdetail/${item.postId}`}
                  >
                    <ResultText>{item.title}</ResultText>
                    <ResultDate>
                      {item.createdAt?.split("T")[0].split("-").join(".")}
                    </ResultDate>
                  </ResultItem>
                ))}
              </ResultList>
            ) : (
              <ResultText>결과가 없습니다.</ResultText>
            )}
          </div>
        </>
      )}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
    </Container>
  );
};

export default SearchPage;
