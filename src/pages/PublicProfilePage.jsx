import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Review, Button, AlertModal } from "../components";
import { Star, ChevronLeft } from "react-feather";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 30px 20px;
  height: 100vh;
  overflow: hidden;
  position: relative;
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
  margin-bottom: 10px;
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
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
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
  font-family: ${({ theme }) => theme.fonts.bold};
  margin-left: 5px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: #656565;
  margin-bottom: 10px;
  margin-top: 5px;
`;

const ScrollSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2; /* 경력 섹션 비율 */
  min-height: 0;
  margin: 10px 5px 0 5px;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const ReviewScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const CareerText = styled.p`
  font-size: 15px;
  color: #000;
`;

const PlaceholderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  text-align: center;
`;

const Placeholder = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  margin-bottom: 10px;
`;

const ReviewSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3; /* 리뷰 섹션 비율 */
  margin: 10px 5px 40px 5px;
  min-height: 0;
`;
const Footer = styled.div`
  padding: 10px 20px;
  background-color: #fff;
  margin-bottom: 50px;
`;

const PublicProfilePage = ({ userId: profileUserId }) => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewerId, setReviewerId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("alert");
  const navigate = useNavigate();
  const { userId } = useParams();
  // 프로필 불러오기
  const fetchUserProfile = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.warn("⚠️ accessToken 없음");
        setIsLoading(false); // 반드시 로딩 해제
        return;
      }

      const res = await api.get(`/profile/${userId}`, {
        headers: { access: accessToken },
      });

      console.log("✔️프로필 API 응답: ", res.data);
      const data = res.data?.data || res.data;
      setUser({
        name: data.name,
        image: data.image,
        career: data.career,
        totalStar: (data.ratingAverage ?? 0).toFixed(1),
      });
    } catch (error) {
      console.error("❌ 프로필 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 불러오기
  const fetchReviews = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const res = await api.get(`/review/${userId}`, {
        headers: { access: accessToken },
      });

      const reviewList = res.data.dtoList || res.data.data || [];
      const mapped = reviewList.map((item) => ({
        star: item.star,
        sentence: item.sentence,
        createdAt: item.createdAt?.split("T")[0].split("-").join("."),
      }));

      setReviews(mapped.length > 0 ? mapped : [] /*mapped*/);
    } catch (error) {
      console.error("❌ 리뷰 불러오기 실패:", error);
      setReviews([]);
      {
        /*더미 제거시 제거*/
      }
    }
  };

  // 로그인 유저 ID 가져오기
  const getMyUserId = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) return null;

      const res = await api.get("/mypage/me", {
        headers: { access: accessToken },
      });

      const data = res.data.data;

      setReviewerId(data);

      console.log("✔️ 로그인 유저 ID:", data);
      console.log("✔️ 프로필 유저 ID:", userId);

      return data;
    } catch (error) {
      console.error("❌ 로그인 유저 ID 가져오기 실패:", error);

      return null;
    }
  };

  // 리뷰 작성 가능 여부 확인
  const checkReviewEligibility = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || !reviewerId || !userId) {
        setModalMessage(
          "로그인 정보가 유효하지 않거나 프로필 정보를 불러올 수 없습니다"
        );
        setModalType("alert");
        setModalVisible(true);
        return;
      }

      if (Number(reviewerId) === Number(userId)) {
        setModalMessage("본인의 리뷰를 작성할 수 없습니다");
        setModalType("alert");
        setModalVisible(true);
        return;
      }

      const requestData = { userId1: reviewerId, userId2: userId };
      const res = await api.post("/payments/review/eligibility", requestData, {
        headers: { access: accessToken },
      });

      const responseData = res.data.data;
      if (responseData && responseData.participationCount > 0) {
        setModalMessage(
          `${
            responseData.message || "리뷰 권한 확인 완료"
          }\n리뷰를 작성하시겠습니까?`
        );
        setModalType("confirm");
        setModalVisible(true);
      } else {
        setModalMessage(responseData.message || "리뷰 작성 권한이 없습니다");
        setModalType("alert");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("❌ 리뷰 권한 확인 실패:", error);
      setModalMessage("리뷰 권한 확인에 실패했습니다");
      setModalType("alert");
      setModalVisible(true);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);

    // modalType이 'confirm'인 경우에만 리뷰 작성 페이지로 이동합니다.
    if (modalType !== "confirm") {
      return;
    }

    // user와 userId가 유효한지 안전 장치를 통해 확인
    if (!user || !userId) {
      console.error("리뷰 작성에 필요한 사용자 데이터가 누락되었습니다.");
      setModalMessage("리뷰 작성을 위한 필수 정보가 부족합니다.");
      setModalType("alert");
      setModalVisible(true);
      return;
    }

    // ★★★ 수정: URL 쿼리 파라미터로 데이터를 전달합니다. ★★★
    // 이름이나 이미지가 null인 경우를 대비해 안전하게 인코딩합니다.
    const targetName = user.name || "";
    const targetImage = user.image || "";

    const encodedName = encodeURIComponent(targetName);
    const encodedImage = encodeURIComponent(targetImage);

    // "/review" 경로 뒤에 ?name=...&userId=... 형식으로 데이터를 붙입니다.
    navigate(
      `/review?name=${encodedName}&userId=${userId}&image=${encodedImage}`
    );
  };

  const handleModalCancel = () => setModalVisible(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(profileUserId);
      fetchReviews(profileUserId);
    }
    getMyUserId();
  }, [userId]);

  if (isLoading) {
    return (
      <Container>
        <PlaceholderWrapper>
          <Placeholder>로딩 중...</Placeholder>
        </PlaceholderWrapper>
      </Container>
    );
  }

  return (
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
          <UserName>{user?.name}</UserName>
          <StarContainer>
            <Star size={18} color="#FFC107" />
            <StarText>{user?.totalStar || "0.0"}</StarText>
          </StarContainer>
        </UserInfo>
      </ProfileContainer>

      <Divider />

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
        <ReviewScrollArea>
          {reviews.length > 0 ? (
            reviews.map((review) => <Review key={review.key} {...review} />)
          ) : (
            <PlaceholderWrapper>
              <Placeholder>등록되지 않았습니다</Placeholder>
            </PlaceholderWrapper>
          )}
        </ReviewScrollArea>
      </ReviewSection>

      <Footer>
        <Button onClick={checkReviewEligibility} title="리뷰 작성" />
      </Footer>

      <AlertModal
        visible={modalVisible}
        message={modalMessage}
        onConfirm={handleModalConfirm}
        onCancel={modalType === "confirm" ? handleModalCancel : null}
      />
    </Container>
  );
};

export default PublicProfilePage;
