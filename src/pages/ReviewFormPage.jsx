import React, { useState, useEffect } from "react";
import { Button, AlertModal } from "../components";
import styled, { ThemeContext } from "styled-components";
import { ChevronLeft } from "react-feather";
import { FaStar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
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
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
  object-fit: cover;
`;

const NameStar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const NameText = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 5px;
  margin-left: 3px;
`;

const StarRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const ReviewInput = styled.textarea`
  width: 100%;
  height: 230px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  resize: none;
  outline: none;
`;

const ReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get("name");
  const image = searchParams.get("image");
  const userId = searchParams.get("userId"); // targetUserId로 사용될 값

  const [form, setForm] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [rating, setRating] = useState(0);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  useEffect(() => {
    setDisabled(form.trim().length === 0 || rating < 1 || !userId);
  }, [form, rating, userId]);

  // 별 그리기 함수
  const renderStars = () => {
    return (
      <StarRow>
        {[1, 2, 3, 4, 5].map((num) => (
          <FaStar
            key={num}
            fill={rating >= num ? "#FFD000" : "#e1e1e1"}
            stroke="#FFD000"
            size={23}
            style={{ marginHorizontal: 2, cursor: "pointer" }}
            onClick={() => {
              setRating(num);
            }}
          />
        ))}
      </StarRow>
    );
  };

  const handleReviewSubmit = async () => {
    if (!userId) {
      setAlertMessage("리뷰 대상 사용자 정보가 누락되었습니다.");
      setAlertVisible(true);
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");

      await api.post(
        "/review",
        {
          targetUserId: Number(userId),
          star: rating,
          sentence: form,
        },
        {
          headers: {
            access: accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      setAlertMessage("리뷰 등록이 완료되었습니다.");
      // 완료 후 이전 페이지로 돌아가기
      setOnConfirmAction(() => () => navigate(-1));
      setAlertVisible(true);
    } catch (e) {
      console.error("리뷰 등록 실패:", e);
      setAlertMessage("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
      setOnConfirmAction(null);
      setAlertVisible(true);
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
      </HeaderContainer>
      <ProfileContainer>
        <ProfileImage
          src={
            image ||
            "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
          }
          alt="프로필 이미지"
        />

        <NameStar>
          <NameText>{name || "이름 없음"} 님에 대한 리뷰 </NameText>
          {renderStars()}
        </NameStar>
      </ProfileContainer>

      <ReviewInput
        value={form}
        onChange={(e) => setForm(e.target.value)}
        placeholder={"사용자를 평가해주세요!\n어떤 사용자였나요?"}
        rows={10}
      />
      <Button
        title="제출"
        disabled={disabled}
        onClick={handleReviewSubmit}
        style={{
          width: 82,
          height: 35,
          marginTop: 20,
          alignSelf: "center",
        }}
        textStyle={{ fontSize: 16 }}
      />

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
          if (onConfirmAction) onConfirmAction();
        }}
      />
    </Container>
  );
};

export default ReviewForm;
