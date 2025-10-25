import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronLeft } from "react-feather";
//import api from "../api/api";

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

  const navigate = useNavigate();
  /*
  // 🧩 더미 데이터
  const dummyFaqs = [
    {
      id: 1,
      question: "회원가입은 어떻게 하나요?",
      answer:
        "홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.",
    },
    {
      id: 2,
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 통해 재설정할 수 있습니다.",
    },
    {
      id: 3,
      question: "문의는 어디로 하면 되나요?",
      answer:
        "고객센터 이메일 <strong>support@moamoa.com</strong> 로 문의해주세요.",
    },
    {
      id: 4,
      question: "회원가입은 어떻게 하나요?",
      answer:
        "홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.",
    },
    {
      id: 5,
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 통해 재설정할 수 있습니다.",
    },
    {
      id: 6,
      question: "문의는 어디로 하면 되나요?",
      answer:
        "고객센터 이메일 <strong>support@moamoa.com</strong> 로 문의해주세요.",
    },
    {
      id: 7,
      question: "회원가입은 어떻게 하나요?",
      answer:
        "홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.\n홈페이지 우측 상단의 회원가입 버튼을 클릭하시면 됩니다.",
    },
    {
      id: 8,
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 통해 재설정할 수 있습니다.",
    },
    {
      id: 9,
      question: "문의는 어디로 하면 되나요?\n문의는 어디로 하면 되나요?",
      answer:
        "고객센터 이메일 <strong>support@moamoa.com</strong> 로 문의해주세요.",
    },
  ];

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
      try {
        const res = await api.get("/faqs");
        setFaqs(res.data.faqs || []);
      } catch (err) {
        console.error("❌ FAQ 목록 조회 실패:", err);
      }
    };
    fetchFaqs();
  }, []);

  //FAQ 상세 조회
  const handleToggle = async (faqId) => {
    if (openId === faqId) {
      setOpenId(null);
      return;
    }

    try {
      const res = await api.get(`/faqs/${faqId}`);
      setSelectedFaq(res.data);
      setOpenId(faqId);
    } catch (err) {
      console.error("❌ FAQ 상세 조회 실패:", err);
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
