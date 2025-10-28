import React, { useState, useContext, useEffect, useRef } from "react";
import styled, { ThemeContext } from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import {
  FiHeart,
  FiDollarSign,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiClock,
  FiMoreHorizontal,
} from "react-icons/fi";
import { ChevronLeft } from "react-feather";

import api from "../api/api";
//import LoginModal from "../components/LoginModal";
import AlertModal from "../components/AlertModal";
import Button from "../components/Button";

const Container = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #fff;
  min-height: 100vh;
  position: relative;
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
  min-height: 100px;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-top: 40px;
`;

const MoreMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 8px;
  padding: 5px;
  z-index: 15;
`;

const MenuItem = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
`;

const MenuText = styled.span`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ $danger }) => ($danger ? "red" : "#000")};
`;

const DateText = styled.span`
  display: block;
  margin-top: -20px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const Content = styled.p`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regular};
  line-height: 30px;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const Info = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.grey};
  margin-top: 15px;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const ProfileHeader = styled.div`
  display: flex;
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

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const Label = styled.span`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.grey};
  margin-right: 5px;
  margin-left: 5px;
`;

const ProfileName = styled.span`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: #000;
`;

const ProfileIntro = styled.p`
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
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
  padding: 10px 10px 10px 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 7px;
`;

const LikeText = styled.span`
  margin-left: 7px;
  margin-top: 2px;
  font-size: 18px;
  color: ${({ $liked, theme }) => ($liked ? "#FF6B6B" : theme.colors.grey)};
`;

// 모임 상세 페이지 (내 게시물)
const MyPostDetailPage = () => {
  const theme = useContext(ThemeContext);
  const { postId } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [meeting, setMeeting] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [user, setUser] = useState(null);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { access: token } : {};
      const res = await api.get(`/posts/${postId}`, { headers });
      const data = res.data.data;

      console.log("상세 데이터:", data);

      const userData = await api.get(`/profile/${data.userId}`, { headers });
      const userInfo = userData.data.data;

      console.log("유저 데이터:", userInfo);

      setMeeting({
        postId: data.id,
        title: data.title,
        createdAt: data.createdAt.split("T")[0].split("-").join("."),
        content: data.content,
        location: data.location,
        maxParticipants: data.membersMax,
        recruitmentStart: data.createdAt.split("T")[0],
        recruitmentEnd: data.dueDate,
        activityStart: data.activityStartDate,
        activityEnd: data.activityEndDate,
        deposit: data.warranty,
        category: data.category,
        tags: [`#${data.category}`],
        likes: data.likesCount,
      });
      setUser({
        userId: data.userId,
        name: userInfo.name,
        career: userInfo.career,
        image: userInfo.image,
      });
      setLikes(data.likesCount);
      setLiked(data.liked ?? false);
    } catch (e) {
      console.error("상세 데이터 로딩 실패", e);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAlertMessage("로그인이 필요합니다.");
        setAlertVisible(true);
        return;
      }

      if (!liked) {
        const res = await api.post(
          `/posts/${postId}/likes`,
          {},
          { headers: { access: token } }
        );
        if (res.status === 201) {
          setLiked(true);
          setLikes((prev) => prev + 1);
        }
      } else {
        const res = await api.delete(`/posts/${postId}/likes`, {
          headers: { access: token },
        });
        if (res.status === 200) {
          setLiked(false);
          setLikes((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
      setAlertMessage("좋아요 처리 중 문제가 발생했습니다.");
      setAlertVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAlertMessage("삭제를 위해 로그인해주세요.");
        setAlertVisible(true);
        return;
      }
      const response = await api.delete(`/posts/${postId}`, {
        headers: { access: token },
      });
      if (response.status === 200) {
        setAlertMessage("게시글이 삭제되었습니다.");
        setAlertVisible(true);
        navigate("/");
      }
    } catch (error) {
      console.error("게시글 삭제 실패", error);
      setAlertMessage("게시글 삭제 중 오류가 발생했습니다.");
      setAlertVisible(true);
    }
  };

  if (!meeting || !user) return <div>불러오는 중...</div>;

  const recruitmentDeadline = new Date(`${meeting.recruitmentEnd}T23:59:59`);
  const isRecruitmentClosed = recruitmentDeadline < new Date();

  const handleFooterButtonClick = () => {
    if (isRecruitmentClosed) {
      navigate(`/editpost/${meeting.postId}`, {
        state: {
          title: meeting.title,
          description: meeting.content,
          selectedCity: meeting.location?.split(" ")[0] || null,
          selectedDistrict: meeting.location?.split(" ")[1] || null,
          category: meeting.category, // ← 여기 추가
          maxParticipants: meeting.memberMax,
          deposit: meeting.deposit,
          tags: meeting.tags.join(" "), // 또는 필요에 따라
          recruitmentStart: meeting.recruitmentStart,
          recruitmentEnd: meeting.recruitmentEnd,
          activityStart: meeting.activityStart,
          activityEnd: meeting.activityEnd,
          isRecreate: true,
        },
      });
    } else {
      // ✅ navigate 함수를 직접 호출합니다.
      navigate("/applicationlist", { state: { postId: meeting.postId } });
    }
  };

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
          <RowContainer>
            <FiMoreHorizontal
              name="more-horizontal"
              size={22}
              onClick={() => setMenuVisible(!menuVisible)}
              style={{ cursor: "pointer" }}
            />
          </RowContainer>
        </RowContainer>

        {menuVisible && (
          <MoreMenu ref={menuRef}>
            <MenuItem
              onClick={() =>
                navigate(`/editpost/${meeting.postId}`, {
                  state: {
                    title: meeting.title,
                    description: meeting.content,
                    selectedCity: meeting.location?.split(" ")[0] || null,
                    selectedDistrict: meeting.location?.split(" ")[1] || null,
                    category: meeting.category, // ← 여기 추가
                    maxParticipants: meeting.memberMax,
                    deposit: meeting.deposit,
                    tags: meeting.tags.join(" "), // 또는 필요에 따라
                    recruitmentStart: meeting.recruitmentStart,
                    recruitmentEnd: meeting.recruitmentEnd,
                    activityStart: meeting.activityStart,
                    activityEnd: meeting.activityEnd,
                  },
                })
              }
            >
              <MenuText>수정</MenuText>
            </MenuItem>
            <Divider style={{ marginTop: "3px", marginBottom: "3px" }} />
            <MenuItem onClick={handleDelete}>
              <MenuText $danger>삭제</MenuText>
            </MenuItem>
          </MoreMenu>
        )}

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

        <Info style={{ color: theme.colors.mainBlue, marginTop: 10 }}>
          {meeting.tags.join("  ")}
        </Info>
        <Divider />
      </Section>

      {/* 작성자 정보 */}
      <ProfileContainer>
        <ProfileHeader>
          <ProfileImageContainer>
            <ProfileImage
              src={
                user.image ||
                "https://ssl.pstatic.net/static/pwe/address/img_profile.png"
              }
              alt="profile"
            />
          </ProfileImageContainer>
          <RowContainer>
            <Label>작성자</Label>
            <ProfileName>{user.name}</ProfileName>
          </RowContainer>
        </ProfileHeader>
        <ProfileIntro>{user.career}</ProfileIntro>
      </ProfileContainer>

      {/* 하단 고정 */}
      <Footer>
        <LikeButton onClick={toggleLike}>
          {liked ? (
            <AiFillHeart size={24} color="#FF6B6B" />
          ) : (
            <FiHeart size={24} color={theme.colors.grey} />
          )}
          <LikeText $liked={liked}>{likes}</LikeText>
        </LikeButton>
        <Button
          title={isRecruitmentClosed ? "모임 재생성하기" : "신청 목록 확인"}
          onClick={handleFooterButtonClick}
          style={{ height: 50, width: 280 }}
        />
      </Footer>

      {/*<LoginModal /> */}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
      {confirmVisible && (
        <AlertModal
          visible={confirmVisible}
          message="정말 삭제하시겠습니까?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </Container>
  );
};

export default MyPostDetailPage;
