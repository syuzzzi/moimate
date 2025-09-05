import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { Feather, ChevronLeft } from "react-feather";
import api from "../api/api";
import theme from "../theme";
import { Button, Input, AlertModal } from "../components";

// styled-components/native에서 styled-components로 변경
const Container = styled.div`
  flex: 1;
  background-color: #fff;
  padding-top: 30px;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  position: relative;
  margin-bottom: 30px;
  width: 100%;
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  color: ${({ theme }) => theme.colors.black};
  position: absolute;
  left: 50%;
  transform: translate(-50%);
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
  z-index: 10;
`;

const Spacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ProfileImageContainer = styled.div`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraIconContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: white;
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
`;

const Label = styled.label`
  align-self: flex-start;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  const [image, setImage] = useState(user?.image || null);
  const [career, setCareer] = useState(user?.career || "");
  const [disabled, setDisabled] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await api.get("/mypage/me", {
          headers: {
            access: token,
          },
        });
        const userId = res.data.data;
        const profileRes = await api.get(`/profile/${userId}`, {
          headers: {
            access: token,
          },
        });
        const userCareer = profileRes.data.data.career || "";
        console.log("📦 불러온 career:", userCareer);
        setCareer(userCareer);
        setImage(profileRes.data.data.image || null);
      } catch (err) {
        console.warn("❌ 경력 불러오기 실패:", err.message);
      }
    };

    if (!user?.career) {
      fetchCareer();
    }
  }, [user]);

  useEffect(() => {
    setDisabled(career.trim().length === 0);
  }, [career]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAlertMessage("로그인 상태가 아닙니다.");
        setAlertVisible(true);
        return;
      }

      const formData = new FormData();
      formData.append("career", career);

      const fileInput = document.getElementById("profile-image-input");
      if (fileInput.files.length > 0) {
        formData.append("image", fileInput.files[0]);
      }

      const res = await api.patch("/mypage/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          access: `${token}`,
        },
      });

      console.log("✅ 저장 성공:", res.data);

      navigate(-1);
    } catch (error) {
      console.error("❌ 저장 실패:", error);
      setAlertMessage("프로필 저장에 실패했습니다.");
      setAlertVisible(true);
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
        <HeaderTitle>사진/경력 수정</HeaderTitle>
        <Spacer />
      </HeaderContainer>

      <ProfileImageContainer>
        <label
          htmlFor="profile-image-input"
          style={{ width: "100%", height: "100%" }}
        >
          {image ? (
            <ProfileImage src={image} alt="Profile" />
          ) : (
            <ProfileImage
              src="https://ssl.pstatic.net/static/pwe/address/img_profile.png"
              alt="Default Profile"
            />
          )}
          <CameraIconContainer>
            <Feather name="camera" size={14} color="#777" />
          </CameraIconContainer>
        </label>
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </ProfileImageContainer>

      <Label htmlFor="career-input">경력</Label>
      <Input
        id="career-input"
        value={career}
        onChange={(e) => setCareer(e.target.value)}
        placeholder="경력을 적어주세요!"
        containerStyle={{ marginTop: 0, width: "100%" }}
        textStyle={{ height: 300 }}
        multiline={true}
        numberOfLines={10}
      />

      <ButtonContainer>
        <Button
          title="저장"
          onClick={handleSave}
          disabled={disabled}
          containerStyle={{ height: 40, width: 85 }}
          textStyle={{ fontSize: 16, marginLeft: 0 }}
          style={{ height: 40, width: 85 }}
        />
      </ButtonContainer>
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
        }}
      />
    </Container>
  );
};

export default EditProfile;
