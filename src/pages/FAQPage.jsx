import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronLeft } from "react-feather";
import api from "../api/api";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  padding: 30px 20px;
  min-height: 100vh;
  overflow-y: auto;
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
const HeaderTitle = styled.h1`
  font-size: 16px;

  font-family: ${({ theme }) => theme.fonts.extraBold};
  color: ${({ theme }) => theme.colors.black};
`;

// FAQ 목록
const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

// 카드
const StyledCard = styled.div`
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background: white;
  overflow: hidden;
`;

// 질문 버튼
const QuestionButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  text-align: left;
  background: white;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
`;

// 질문 텍스트
const QuestionText = styled.span`
  font-family: ${({ theme }) => theme.fonts.bold};
  flex: 1;
`;

// 아이콘
const ChevronIcon = styled(ChevronDown)`
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
`;

// 답변 박스
const AnswerBox = styled.div`
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
`;

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isDummy, setIsDummy] = useState(false); // 더미 데이터 사용 여부
  const navigate = useNavigate();

  // 🧩 더미 데이터
  const dummyFaqs = [
    {
      id: 1,
      question: "외국인 근로자 여권정보 변경",
      answer:
        "외국인근로자 여권정보 변경 후 하이코리아 신고 와는 별도로\n추가로 관할 지청에 외국인근로자 여권정보 변경 신청을 하셔야 합니다.\n관할 지청은 홈페이지 > 유관기관 찾기 > 고용노동부(고용센터) > 지청업무: 수행 를 통해 확인 가능합니다.",
    },
    {
      id: 2,
      question: "태국인이 한국에 여행가려고 하는데 비자를 신청해야 하나요?",
      answer:
        " 태국 등 무비자 입국이 가능한 국가(지역) 국민은 관광/친지방문/회의참가 등의 목적으로 한국을 방문하는 경우 사전에 전자여행허가(K-ETA) 허가를 받아야 합니다. K-ETA가 불허된 경우 우리 대사관에서 비자를 신청하셔야 합니다.\n※ K-ETA 신청 대상국가 확인 및 신청 홈페이지: www.k-eta.go.kr",
    },
  ];
  /*
  // 초기 로드 시 더미데이터 세팅
  useEffect(() => {
    setFaqs(dummyFaqs);
  }, []);

  // FAQ 상세 조회 대신 더미 데이터 사용
  const handleToggle = (faqId) => {
    if (openId === faqId) {
      setOpenId(null);
      return;
    }

    const faq = dummyFaqs.find((f) => f.id === faqId);
    setSelectedFaq(faq);
    setOpenId(faqId);
  };*/

  // FAQ 목록 조회
  useEffect(() => {
    const fetchFaqs = async () => {
      const accessToken = localStorage.getItem("accessToken");

      try {
        const res = await api.get("/faqs");

        console.log("✔️ FAQ 목록 조회 응답:", res.data);

        const fetchedFaqs = res.data.faqs || [];

        if (fetchedFaqs.length === 0) {
          // API 응답에 데이터가 없거나 비어있을 경우 더미 데이터 사용
          console.warn("API 데이터가 없어 더미 데이터를 로드합니다.");
          setFaqs(dummyFaqs);
          setIsDummy(true);
        } else {
          setFaqs(fetchedFaqs);
          setIsDummy(false);
        }
      } catch (err) {
        console.error("❌ FAQ 목록 조회 실패:", err);
        setFaqs(dummyFaqs);
        setIsDummy(true);
      }
    };
    fetchFaqs();
  }, []);

  //FAQ 상세 조회
  const handleToggle = async (faqId) => {
    if (openId === faqId) {
      setOpenId(null);
      setSelectedFaq(null);
      return;
    }

    if (isDummy) {
      // 더미 데이터를 사용하는 경우: 목록에서 상세 정보를 찾아서 바로 표시
      const faq = dummyFaqs.find((f) => f.id === faqId);
      setSelectedFaq(faq);
      setOpenId(faqId);
      return;
    }

    try {
      const res = await api.get(`/faqs/${faqId}`);
      setSelectedFaq(res.data);
      setOpenId(faqId);
    } catch (err) {
      console.error("❌ FAQ 상세 조회 실패:", err);
      // 상세 조회 실패 시에도 열리지 않도록 처리
      setOpenId(null);
      setSelectedFaq(null);
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#333" />
        </BackButton>
        <HeaderTitle>FAQ</HeaderTitle>
      </HeaderContainer>

      <FaqList>
        {faqs.map((faq) => (
          <StyledCard key={faq.id}>
            <QuestionButton onClick={() => handleToggle(faq.id)}>
              <QuestionText>Q. {faq.question}</QuestionText>
              <ChevronIcon $open={openId === faq.id} />
            </QuestionButton>

            {openId === faq.id && selectedFaq?.id === faq.id && (
              <AnswerBox>
                <div dangerouslySetInnerHTML={{ __html: selectedFaq.answer }} />
              </AnswerBox>
            )}
          </StyledCard>
        ))}
      </FaqList>
    </Container>
  );
}
