import React, { useState, useCallback, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Star, ChevronLeft } from "react-feather";
import api from "../api/api";
import { Button, Review } from "../components";
import { jwtDecode } from "jwt-decode";

// 스타일
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 30px 20px;
`;
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  position: relative;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  color: ${({ theme }) => theme.colors.black};
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const UserName = styled.p`
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-right: 15px;
  color: ${({ theme }) => theme.colors.mainBlue};
`;

const StarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StarText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.mainBlue};
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-left: 5px;
`;

const EditButton = styled.div`
  margin-top: 5px;

  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: #656565;
  margin-bottom: 8px;
`;

const ScrollSection = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 200px;
  flex-shrink: 0;
  margin: 10px 5px 0 5px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const CareerText = styled.p`
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.black};
`;

const PlaceholderWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

const Placeholder = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
  text-align: center;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  margin-bottom: 10px;
`;

const ReviewSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 10px 5px 0 5px;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  padding: 5px 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  z-index: 100;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Review 컴포넌트 (Review.jsx에 있다고 가정)
const ReviewComponent = ({ star, sentence, createdAt }) => (
  <div style={{ marginBottom: "10px" }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <Star size={16} color="#FFC107" />
      <p style={{ margin: "0 5px", fontWeight: "bold" }}>{star}</p>
      <p style={{ margin: "0", color: "gray" }}>{sentence}</p>
    </div>
    <p style={{ margin: "0", fontSize: "12px", color: "gray" }}>{createdAt}</p>
  </div>
);

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams(); // useParams 훅으로 userId를 가져옵니다.
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(false);
  // 수정된 데이터를 받아와서 user 상태를 업데이트하는 함수
  const handleUpdate = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const myUserIdRes = await api.get("/mypage/me", {
        headers: { access: token },
      });
      const myUserId = myUserIdRes.data.data;
      setIsMyProfile(String(userId) === String(myUserId));

      if (!token) throw new Error("토큰 없음");

      const profileRes = await api.get(`/profile/${userId}`, {
        headers: { access: token },
      });

      const { name, image, career, ratingAverage } = profileRes.data.data;
      setUser({
        name,
        image,
        career,
        totalStar: ratingAverage?.toFixed(1) ?? "0.0",
      });

      const reviewRes = await api.get(`/review/${userId}`, {
        headers: { access: token },
      });

      const mapped = reviewRes.data.dtoList.map((r, index) => ({
        key: index,
        star: r.star,
        sentence: r.sentence,
        createdAt: r.createdAt?.split("T")[0].split("-").join("."),
      }));

      setReviews(mapped);
    } catch (error) {
      console.warn("⚠️ 프로필 로딩 실패:", error.message);
      if (error.message === "토큰 없음") {
        setIsModalVisible(true);
      } else {
        setUser({
          name: "사용자",
          image: null,
          career: "",
          totalStar: "0.0",
        });
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    load();
  }, [load, location.state]);

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate("/login");
  };

  // '사진 / 경력 수정' 버튼 클릭 핸들러 수정
  const handleEdit = () => {
    navigate(`/editprofile`, { state: { user } });
  };

  const handleSignout = async () => {
    try {
      await localStorage.removeItem("accessToken");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 에러 발생:", error);
    }
  };

  const handleDeleteAccount = () => {
    // 회원탈퇴 로직 구현
    navigate("/회원탈퇴");
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <p>로딩 중...</p>
      </LoadingContainer>
    );
  }

  return (
    <>
      <Container>
        <HeaderContainer>
          <BackButton onClick={() => navigate(-1)}>
            <ChevronLeft size={24} color="#333" />
          </BackButton>
          <HeaderTitle>프로필</HeaderTitle>
        </HeaderContainer>
        <ProfileContainer>
          <ProfileImage
            src={
              user?.image ||
              "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
            }
          />
          <UserInfo>
            <UserName>{user?.name || "사용자"}</UserName>
            <StarContainer>
              <Star size={18} color="#FFC107" />
              <StarText>{user?.totalStar || "0.0"}</StarText>
            </StarContainer>
          </UserInfo>
        </ProfileContainer>
        <EditButton>
          <Button
            title="사진 / 경력 수정"
            onClick={handleEdit}
            style={{ height: "40px", width: "100%" }}
            textStyle={{ fontFamily: theme.fonts.bold, fontSize: 16 }}
          />
        </EditButton>

        <ScrollSection>
          <SectionTitle>경력</SectionTitle>
          <ScrollArea>
            {user?.career ? (
              <CareerText>{user.career}</CareerText>
            ) : (
              <PlaceholderWrapper>
                <Placeholder>등록되지 않았습니다</Placeholder>
              </PlaceholderWrapper>
            )}
          </ScrollArea>
        </ScrollSection>
        <Divider />
        <ReviewSection>
          <SectionTitle>리뷰</SectionTitle>
          <ScrollArea>
            {reviews.length > 0 ? (
              reviews.map((review) => <Review key={review.key} {...review} />)
            ) : (
              <PlaceholderWrapper>
                <Placeholder>등록되지 않았습니다</Placeholder>
              </PlaceholderWrapper>
            )}
          </ScrollArea>
        </ReviewSection>

        <ButtonContainer>
          <Button
            title="로그아웃"
            onClick={handleSignout}
            textStyle={{ fontSize: 16, fontFamily: theme.fonts.bold }}
            style={{ width: "95px", height: "40px" }}
          />
          <Button
            title="회원탈퇴"
            onClick={handleDeleteAccount}
            textStyle={{
              fontSize: 16,
              color: theme.colors.black,
              fontFamily: theme.fonts.bold,
            }}
            style={{
              width: "95px",
              height: "40px",
              backgroundColor: theme.colors.lightBlue,
            }}
          />
        </ButtonContainer>
      </Container>
      {/*<LoginModal visible={isModalVisible} onClose={handleModalClose} />*/}
    </>
  );
};

export default ProfilePage;
