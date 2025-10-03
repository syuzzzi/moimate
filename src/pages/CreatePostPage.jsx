import React, { useState, useCallback, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Input, Button, AlertModal } from "../components";
import api from "../api/api";
import { ChevronLeft } from "react-feather";
import Select from "react-select";
import theme from "../theme.js";

// Styled-components for web
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  position: relative;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.bold};
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

const ScrollableContainer = styled.div`
  overflow-y: auto;
  height: 100vh;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 15px;
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.mainBlue};
  font-family: ${({ theme }) => theme.fonts.bold};
`;

const DateText = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.black};
`;

const StyledTextInput = styled.textarea`
  display: block;
  width: 100%;
  height: ${({ $inputHeight }) => $inputHeight || 100}px; /* 기본값 높이 */
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.5; /* input과 통일 */
  color: ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regular};
  resize: none;
  margin-bottom: 20px;
  box-sizing: border-box;
  vertical-align: middle;
`;

const FooterButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
`;

const InputComponent = styled.div`
  margin-bottom: 20px;
`;

const DateInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 160px;
  padding: 15px 12px;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.white};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  box-sizing: border-box;
`;

const DateInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.black};
  cursor: pointer;
`;

// 웹 환경에 맞게 Dropdown과 DateTimePicker를 대체합니다.
const WebCalendarPicker = ({ date, setDate, minDate, disabled }) => {
  const handleDateChange = (e) => {
    setDate(new Date(e.target.value));
  };

  return (
    <DateInputContainer disabled={disabled}>
      <DateInput
        type="date"
        value={date.toISOString().split("T")[0]}
        onChange={handleDateChange}
        min={minDate?.toISOString().split("T")[0]}
        disabled={disabled}
      />
    </DateInputContainer>
  );
};

export const categoryData = [
  { label: "언어", value: "언어" },
  { label: "문화", value: "문화" },
  { label: "맛집", value: "맛집" },
  { label: "KPOP", value: "KPOP" },
  { label: "취미", value: "취미" },
  { label: "취업", value: "취업" },
];

export const cityData = [
  { label: "서울", value: "서울" },
  { label: "부산", value: "부산" },
  { label: "대구", value: "대구" },
  { label: "인천", value: "인천" },
  { label: "광주", value: "광주" },
  { label: "대전", value: "대전" },
  { label: "울산", value: "울산" },
  { label: "세종", value: "세종" },
  { label: "경기도", value: "경기도" },
  { label: "강원도", value: "강원도" },
  { label: "충청북도", value: "충청북도" },
  { label: "충청남도", value: "충청남도" },
  { label: "전라북도", value: "전라북도" },
  { label: "전라남도", value: "전라남도" },
  { label: "경상북도", value: "경상북도" },
  { label: "경상남도", value: "경상남도" },
  { label: "제주도", value: "제주도" },
];

export const districtData = {
  서울: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  부산: [
    "강서구",
    "금정구",
    "기장군",
    "남구",
    "동구",
    "동래구",
    "부산진구",
    "북구",
    "사상구",
    "사하구",
    "서구",
    "수영구",
    "연제구",
    "영도구",
    "중구",
    "해운대구",
  ],
  대구: ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  인천: [
    "강화군",
    "계양구",
    "미추홀구",
    "남동구",
    "동구",
    "부평구",
    "서구",
    "연수구",
    "옹진군",
    "중구",
  ],
  광주: ["광산구", "남구", "동구", "북구", "서구"],
  대전: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산: ["남구", "동구", "북구", "울주군", "중구"],
  세종: [
    "조치원읍",
    "한솔동",
    "도담동",
    "고운동",
    "아름동",
    "종촌동",
    "장군면",
  ],

  경기도: [
    "가평군",
    "고양시",
    "과천시",
    "광명시",
    "광주시",
    "구리시",
    "군포시",
    "김포시",
    "남양주시",
    "동두천시",
    "부천시",
    "성남시",
    "수원시",
    "시흥시",
    "안산시",
    "안성시",
    "안양시",
    "양주시",
    "양평군",
    "여주시",
    "연천군",
    "오산시",
    "용인시",
    "의왕시",
    "의정부시",
    "이천시",
    "파주시",
    "평택시",
    "포천시",
    "하남시",
    "화성시",
  ],
  강원도: [
    "강릉시",
    "고성군",
    "동해시",
    "삼척시",
    "속초시",
    "양구군",
    "양양군",
    "영월군",
    "원주시",
    "인제군",
    "정선군",
    "철원군",
    "춘천시",
    "태백시",
    "평창군",
    "홍천군",
    "화천군",
    "횡성군",
  ],
  충청북도: [
    "괴산군",
    "단양군",
    "보은군",
    "영동군",
    "옥천군",
    "음성군",
    "제천시",
    "진천군",
    "청주시",
    "충주시",
  ],
  충청남도: [
    "계룡시",
    "공주시",
    "금산군",
    "논산시",
    "당진시",
    "보령시",
    "부여군",
    "서산시",
    "서천군",
    "아산시",
    "예산군",
    "천안시",
    "청양군",
    "태안군",
    "홍성군",
  ],
  전라북도: [
    "고창군",
    "군산시",
    "김제시",
    "남원시",
    "무주군",
    "부안군",
    "순창군",
    "완주군",
    "익산시",
    "임실군",
    "장수군",
    "전주시",
    "정읍시",
    "진안군",
  ],
  전라남도: [
    "강진군",
    "고흥군",
    "곡성군",
    "광양시",
    "구례군",
    "나주시",
    "담양군",
    "목포시",
    "무안군",
    "보성군",
    "순천시",
    "신안군",
    "여수시",
    "영광군",
    "영암군",
    "완도군",
    "장성군",
    "장흥군",
    "진도군",
    "함평군",
    "해남군",
    "화순군",
  ],
  경상북도: [
    "경산시",
    "경주시",
    "고령군",
    "구미시",
    "군위군",
    "김천시",
    "문경시",
    "봉화군",
    "상주시",
    "성주군",
    "안동시",
    "영덕군",
    "영양군",
    "영주시",
    "영천시",
    "예천군",
    "울릉군",
    "울진군",
    "의성군",
    "청도군",
    "청송군",
    "칠곡군",
    "포항시",
  ],
  경상남도: [
    "거제시",
    "거창군",
    "고성군",
    "김해시",
    "남해군",
    "밀양시",
    "사천시",
    "산청군",
    "양산시",
    "의령군",
    "진주시",
    "창녕군",
    "창원시",
    "통영시",
    "하동군",
    "함안군",
    "함양군",
    "합천군",
  ],
  제주도: ["서귀포시", "제주시"],
};

const CreatePostPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const descriptionRef = useRef();
  const maxRef = useRef();
  const depositRef = useRef();
  const tagRef = useRef();
  const scrollRef = useRef();

  const [category, setCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputHeight, setInputHeight] = useState(120);

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtList, setDistrictList] = useState([]);

  const [maxParticipants, setMaxParticipants] = useState("");
  const [deposit, setDeposit] = useState("");
  const [tags, setTags] = useState("");

  const [recruitmentStart, setRecruitmentStart] = useState(new Date());
  const [recruitmentEnd, setRecruitmentEnd] = useState(new Date());
  const [activityStart, setActivityStart] = useState(new Date());
  const [activityEnd, setActivityEnd] = useState(new Date());

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  const categoryCodeMap = {
    언어: "LANGUAGE",
    문화: "CULTURE",
    맛집: "FOOD",
    취미: "HOBBY",
    KPOP: "KPOP",
    게임: "GAME",
  };

  const handleSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setAlertMessage("게시글 생성을 위해 로그인이 필요합니다.");
        setOnConfirmAction(() => () => navigate("/login"));
        setAlertVisible(true);
        return;
      }

      const requestBody = {
        title,
        content: description,
        category: categoryCodeMap[category],
        membersMax: Number(maxParticipants),
        location: `${selectedCity} ${selectedDistrict}`,
        dueDate: recruitmentEnd.toISOString().split("T")[0],
        warranty: Number(deposit),
        activityStartDate: activityStart.toISOString().split("T")[0],
        activityEndDate: activityEnd.toISOString().split("T")[0],
        tags: tags.trim().split(" "),
      };

      const response = await api.post("/posts/create", requestBody, {
        headers: {
          access: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const postIdFromHeader =
        response.headers["postid"] ||
        response.headers["location"]?.split("/").pop();

      if (!postIdFromHeader) {
        setAlertMessage("게시글 ID를 찾을 수 없습니다.");
        setOnConfirmAction(null);
        setAlertVisible(true);
        return;
      }

      setAlertMessage("게시글과 채팅방이\n성공적으로 생성되었습니다.");
      setOnConfirmAction(
        () => () =>
          navigate(`/mypostdetail/${postIdFromHeader}`, { replace: true })
      );
      setAlertVisible(true);
    } catch (error) {
      console.error(
        "❌ 게시글 등록 실패:",
        error.response?.data || error.message
      );
      setAlertMessage("게시글 생성 중 오류가 발생했습니다.");
      setOnConfirmAction(null);
      setAlertVisible(true);
    }
  };

  const isFormValid = () => {
    return (
      title &&
      description &&
      selectedCity &&
      selectedDistrict &&
      maxParticipants &&
      deposit &&
      tags &&
      recruitmentEnd &&
      activityStart &&
      activityEnd &&
      category
    );
  };

  useEffect(() => {
    if (selectedCity) {
      setDistrictList(
        districtData[selectedCity]?.map((district) => ({
          label: district,
          value: district,
        })) || []
      );
      setSelectedDistrict(null);
    }
  }, [selectedCity]);

  // Handle DropdownPicker state for web
  const handleDropdownChange = (name, value) => {
    if (name === "city") {
      setSelectedCity(value);
    } else if (name === "district") {
      setSelectedDistrict(value);
    } else if (name === "category") {
      setCategory(value);
    }
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: theme.colors.grey,
      borderRadius: "5px",
      height: "50px",
      fontSize: "16px",
      backgroundColor: theme.colors.white,
      fontFamily: theme.fonts.regular,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme.colors.grey,
    }),
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
        <HeaderTitle>모임 생성</HeaderTitle>
      </HeaderContainer>
      <ScrollableContainer>
        <Label>카테고리</Label>
        <div
          style={{
            width: "45%",
            zIndex: 3000,
            marginBottom: "20px",
            marginTop: "5px",
          }}
        >
          <Select
            options={categoryData}
            value={categoryData.find((opt) => opt.value === category)}
            onChange={(selectedOption) =>
              handleDropdownChange("category", selectedOption.value)
            }
            placeholder="카테고리 선택"
            styles={selectStyles}
          />
        </div>
        <InputComponent>
          <Label>제목</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목"
          />
        </InputComponent>

        <InputComponent>
          <Label>상세설명</Label>
          <StyledTextInput
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`어떤 모임인지 자유롭게 설명해주세요!\n(ex. 주 몇회, 초보자 환영, 필요물품 ...)`}
            $inputHeight={inputHeight}
            style={{ marginTop: "5px" }}
          />
        </InputComponent>

        <Label>지역</Label>
        <RowContainer style={{ zIndex: 2000, marginTop: "5px" }}>
          <div style={{ width: "40%", marginBottom: "20px" }}>
            <Select
              options={cityData}
              value={cityData.find((opt) => opt.value === selectedCity)}
              onChange={(selectedOption) =>
                handleDropdownChange("city", selectedOption.value)
              }
              placeholder="시 선택"
              styles={selectStyles}
            />
          </div>
          <div style={{ width: "40%", marginBottom: "20px" }}>
            <Select
              options={districtList}
              value={districtList.find((opt) => opt.value === selectedDistrict)}
              onChange={(selectedOption) =>
                handleDropdownChange("district", selectedOption.value)
              }
              placeholder="구 선택"
              isDisabled={!selectedCity}
              styles={selectStyles}
            />
          </div>
        </RowContainer>

        <InputComponent style={{ marginTop: -20 }}>
          <Label>모임 최대 인원</Label>
          <Input
            ref={maxRef}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            placeholder="모임을 함께할 최대 인원 수 (ex. 8, 10)"
          />
        </InputComponent>

        <Label>모집 기간</Label>
        <RowContainer style={{ marginTop: "5px" }}>
          <WebCalendarPicker
            date={recruitmentStart}
            setDate={setRecruitmentStart}
            disabled={true}
          />
          <span>~</span>
          <WebCalendarPicker
            date={recruitmentEnd}
            setDate={setRecruitmentEnd}
            minDate={recruitmentStart}
            disabled={!recruitmentStart}
          />
        </RowContainer>

        <Label>활동 기간</Label>
        <RowContainer style={{ marginTop: "5px" }}>
          <WebCalendarPicker date={activityStart} setDate={setActivityStart} />
          <span>~</span>
          <WebCalendarPicker
            date={activityEnd}
            setDate={setActivityEnd}
            minDate={activityStart}
            disabled={!activityStart}
          />
        </RowContainer>

        <InputComponent>
          <Label>보증금</Label>
          <Input
            ref={depositRef}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="₩ 999,999,999"
            style={{ marginBottom: "20px" }}
          />
        </InputComponent>

        <InputComponent>
          <Label>태그</Label>
          <Input
            ref={tagRef}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="#뜨개질 #취미 #종로구"
            style={{ marginBottom: "20px" }}
          />
        </InputComponent>

        <FooterButtonContainer>
          <Button
            title="생성하기"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            style={{
              width: "100%",
              height: "50px",
              padding: "0",
              marginBottom: "50px",
            }}
          />
        </FooterButtonContainer>

        <AlertModal
          visible={alertVisible}
          message={alertMessage}
          onConfirm={() => {
            setAlertVisible(false);
            if (onConfirmAction) onConfirmAction();
          }}
        />
      </ScrollableContainer>
    </Container>
  );
};

export default CreatePostPage;
