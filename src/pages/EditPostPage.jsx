import React, { useState, useEffect, useMemo, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { ChevronLeft } from "react-feather";
import "react-datepicker/dist/react-datepicker.css";
import { Input, Button, AlertModal } from "../components";
import { categoryData, cityData, districtData } from "./CreatePostPage";
import api from "../api/api";

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
  margin-top: 20px;
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

// 안전한 날짜 변환
const safeParseDate = (value) => {
  if (!value || typeof value !== "string") return new Date();
  const [y, m, d] = value.split("-");
  if (y && m && d) {
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

const WebCalendarPicker = ({ date, setDate, minDate, disabled }) => {
  const handleDateChange = (e) => {
    setDate(new Date(e.target.value));
  };

  // ⭐ date prop이 유효한 Date 객체인지 확인
  const dateValue =
    date && !isNaN(date) ? date.toISOString().split("T")[0] : "";
  const minDateValue =
    minDate && !isNaN(minDate) ? minDate.toISOString().split("T")[0] : "";

  return (
    <DateInputContainer disabled={disabled}>
      <DateInput
        type="date"
        value={dateValue} // ⭐ 유효한 값만 사용
        onChange={handleDateChange}
        min={minDateValue} // ⭐ 유효한 값만 사용
        disabled={disabled}
      />
    </DateInputContainer>
  );
};

const EditPostPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const descriptionRef = useRef();
  const maxRef = useRef();
  const depositRef = useRef();
  const tagRef = useRef();

  const location = useLocation();
  const { postId } = useParams();
  const params = location.state || {};

  const {
    title: initialTitle,
    description: initialDesc,
    selectedCity: initialCity,
    selectedDistrict: initialDistrict,
    category: initialCategory,
    maxParticipants,
    deposit,
    tags,
    recruitmentStart,
    recruitmentEnd,
    activityStart,
    activityEnd,
    isRecreate = false,
  } = params;
  const [inputHeight, setInputHeight] = useState(120);
  const [title, setTitle] = useState(initialTitle || "");
  const [description, setDescription] = useState(initialDesc || "");
  const [category, setCategory] = useState(initialCategory || null);
  const [selectedCity, setSelectedCity] = useState(initialCity || null);
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialDistrict || null
  );
  const [districtList, setDistrictList] = useState([]);
  const [recruitStart, setRecruitStart] = useState(
    safeParseDate(recruitmentStart)
  );
  const [recruitEnd, setRecruitEnd] = useState(safeParseDate(recruitmentEnd));
  const [activityStartDate, setActivityStartDate] = useState(
    safeParseDate(activityStart)
  );
  const [activityEndDate, setActivityEndDate] = useState(
    safeParseDate(activityEnd)
  );
  const [max, setMax] = useState(maxParticipants || "");
  const [money, setMoney] = useState(deposit || "");
  const [tagText, setTagText] = useState(tags || "");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (selectedCity) {
      setDistrictList(
        districtData[selectedCity]?.map((d) => ({ label: d, value: d })) || []
      );
    }
  }, [selectedCity]);

  const isFormValid = () => {
    return (
      title &&
      description &&
      selectedCity &&
      selectedDistrict &&
      category &&
      max &&
      money &&
      tagText &&
      recruitEnd &&
      activityStartDate &&
      activityEndDate
    );
  };

  const handleUpdate = async () => {
    const requestBody = {
      title,
      content: description,
      category,
      membersMax: Number(max),
      location: `${selectedCity} ${selectedDistrict}`,
      dueDate: recruitEnd.toISOString().split("T")[0],
      warranty: money,
      activityStartDate: activityStartDate.toISOString().split("T")[0],
      activityEndDate: activityEndDate.toISOString().split("T")[0],
    };

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setAlertMessage("로그인이 필요합니다.");
        setAlertVisible(true);
        return;
      }
      await api.patch(`/posts/${postId}`, requestBody, {
        headers: { access: accessToken, "Content-Type": "application/json" },
      });
      navigate(`/mypostdetail/${postId}`, { replace: true });
    } catch (err) {
      console.error(err);
      setAlertMessage("게시글 수정 중 오류가 발생했습니다.");
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${postId}`);

        const data = res.data.data;

        setTitle(data.title || "");
        setDescription(data.content || "");
        setCategory(data.category || null);
        setMax(data.membersMax || "");
        setMoney(data.warranty || "");
        setTagText(""); // 태그 필드 없으면 빈값

        setRecruitStart(safeParseDate(data.dueDate)); // 모집 종료 날짜
        setRecruitEnd(safeParseDate(data.dueDate)); // API에서는 모집 시작 날짜 없으면 동일하게
        setActivityStartDate(safeParseDate(data.activityStartDate));
        setActivityEndDate(safeParseDate(data.activityEndDate));

        if (data.location) {
          const [city, district] = data.location.split(" ");
          setSelectedCity(city || null);
          setSelectedDistrict(district || null);
        } else {
          setSelectedCity(null);
          setSelectedDistrict(null);
        }
      } catch (err) {
        console.error("게시글 정보를 가져오는 중 오류 발생", err);
      }
    };

    fetchPost();
  }, [postId]);

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: theme.colors.grey,
      borderRadius: "8px",
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
        <HeaderTitle>모임 수정</HeaderTitle>
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
            onChange={(selected) => setCategory(selected.value)}
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
              onChange={(selected) => setSelectedCity(selected.value)}
              placeholder="시 선택"
              styles={selectStyles}
            />
          </div>
          <div style={{ width: "40%", marginBottom: "20px" }}>
            <Select
              options={districtList}
              value={districtList.find((opt) => opt.value === selectedDistrict)}
              onChange={(selected) => setSelectedDistrict(selected.value)}
              placeholder="구 선택"
              isDisabled={!selectedCity}
              styles={selectStyles}
            />
          </div>
        </RowContainer>

        <InputComponent style={{ marginTop: "-20px" }}>
          <Label>모임 최대 인원</Label>
          <Input
            ref={maxRef}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="모임을 함께할 최대 인원 수 (ex. 8, 10)"
          />
        </InputComponent>

        <Label>모집 기간</Label>
        <RowContainer style={{ marginTop: "5px" }}>
          <WebCalendarPicker
            date={recruitStart}
            setDate={setRecruitStart}
            disabled={true}
          />
          <span>~</span>
          <WebCalendarPicker
            date={recruitEnd}
            setDate={setRecruitEnd}
            minDate={recruitStart}
            disabled={!recruitStart}
          />
        </RowContainer>

        <Label>활동 기간</Label>
        <RowContainer style={{ marginTop: "5px" }}>
          <WebCalendarPicker
            date={activityStartDate}
            setDate={setActivityStartDate}
          />
          <span>~</span>
          <WebCalendarPicker
            date={activityEndDate}
            setDate={setActivityEndDate}
            minDate={activityStartDate}
            disabled={!activityStartDate}
          />
        </RowContainer>

        <Label>보증금</Label>
        <Input
          type="number"
          value={money}
          onChange={(e) => setMoney(e.target.value)}
          placeholder="₩ 999,999,999"
          style={{ marginBottom: "20px" }}
        />

        <Label>태그</Label>
        <Input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="#태그"
          style={{ marginBottom: "20px" }}
        />

        <Button title="수정" onClick={handleUpdate} disabled={!isFormValid()} />

        <AlertModal
          visible={alertVisible}
          message={alertMessage}
          onConfirm={() => setAlertVisible(false)}
        />
      </ScrollableContainer>
    </Container>
  );
};

export default EditPostPage;
