import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom"; // React Router
import api from "../api/api";

// ────────────────────────────── Styled (웹 컨테이너)
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  min-height: 100vh;
  text-align: center;
`;

const Instruction = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
`;

// ★★★ 상태 메시지 스타일 추가 ★★★
const StatusMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: ${({ $isError }) => ($isError ? "#ff4d4f" : "#1890ff")};
  margin-top: 20px;
`;
// ────────────────────────────── Component
const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const paymentState = location.state || {};

  const initialAmount = Number(paymentState.amount);
  const initialTitle = paymentState.title || "모임 참가비";
  const initialSomoimId = paymentState.somoimId;
  const initialSessionId = paymentState.sessionId;
  const initialUserName = paymentState.userName || "사용자";

  const [amount, setAmount] = useState(initialAmount);
  const [title, setTitle] = useState(initialTitle);
  const [somoimId, setSomoimId] = useState(initialSomoimId);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [userName, setUserName] = useState(initialUserName);

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const isProcessingRef = useRef(false);

  // ★★★ 상태 메시지 관리 (AlertModal 대체) ★★★
  const [statusMessage, setStatusMessage] = useState("결제 모듈 준비 중...");
  const [isError, setIsError] = useState(false);

  // ────────────────────────────── SDK 로드 useEffect
  useEffect(() => {
    if (window.IMP) {
      setIsSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.onload = () => {
      setIsSdkLoaded(true);
      setStatusMessage("결제 정보를 확인하고 있습니다."); // SDK 로드 성공 메시지
    };
    script.onerror = (e) => {
      console.error("❌ Iamport SDK 로드 실패", e);
      setStatusMessage("결제 모듈 로드에 실패했습니다.");
      setIsError(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // ────────────────────────────── 결제 정보 서버 전송 함수
  const sendPaymentDataToServer = async (data) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatusMessage("결제 정보를 서버에 전송 중..."); // 상태 업데이트

    const currentParams = new URLSearchParams(window.location.search);
    const somoimIdFromUrl = currentParams.get("somoimId");
    const sessionIdFromUrl = currentParams.get("sessionId");

    try {
      const { imp_uid, merchant_uid, success } = data;
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken || !success) {
        throw new Error("결제 실패 또는 인증 오류!");
      }

      const parsedSomoimId = Number(somoimIdFromUrl);
      const parsedSessionId = Number(sessionIdFromUrl);

      if (
        isNaN(parsedSomoimId) ||
        parsedSomoimId < 1 ||
        isNaN(parsedSessionId) ||
        parsedSessionId < 1
      ) {
        console.error("ID 유효성 검사 실패:", {
          somoimIdFromUrl,
          sessionIdFromUrl,
        });
        throw new Error("모임 또는 세션 ID가 유효하지 않습니다.");
      }

      const payload = {
        impUid: imp_uid,
        merchantUid: merchant_uid,
        somoimId: parsedSomoimId,
        sessionId: parsedSessionId,
      };

      const response = await api.post("/payments/verify", payload, {
        headers: { access: accessToken },
      });

      // ★★★ 성공 시 바로 알림 페이지로 이동 ★★★
      setStatusMessage("결제가 성공적으로 완료되었습니다!");
      navigate("/notifications", { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "알 수 없는 오류";

      console.error("❌ 서버 전송 실패/오류:", errorMsg);

      setStatusMessage(`결제 승인 오류: ${errorMsg}`);
      setIsError(true);
      // 실패 시 잠시 메시지를 보여준 후 이전 페이지로 이동 (사용자 경험 개선)
      setTimeout(() => navigate(-1, { replace: true }), 3000);
    } finally {
      isProcessingRef.current = false;
    }
  };

  // ────────────────────────────── 아임포트 결제 요청 함수
  const requestPay = () => {
    if (!isSdkLoaded || !window.IMP) {
      return;
    }

    const IMP = window.IMP;
    IMP.init("imp35072674");

    const redirectUrl = `${window.location.origin}${location.pathname}?somoimId=${somoimId}&sessionId=${sessionId}`;

    IMP.request_pay(
      {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid: `mid_${new Date().getTime()}`,
        name: title,
        amount: amount,
        buyer_name: userName.name,
        buyer_tel: "010-1234-5678",
        m_redirect_url: redirectUrl,
      },
      (rsp) => {
        console.warn("아임포트 콜백 실행됨 (리다이렉션으로 처리)");
      }
    );
    setStatusMessage("결제 모듈로 이동 중입니다..."); // 요청 직후 상태 업데이트
  };

  // ────────────────────────────── 1. 자동 결제 시작 useEffect
  useEffect(() => {
    if (!amount && paymentState.amount) {
      setAmount(initialAmount);
      setTitle(initialTitle);
      setSomoimId(initialSomoimId);
      setSessionId(initialSessionId);
      setUserName(initialUserName);
    }

    const dataValid = amount > 0 && somoimId && sessionId;
    const isInitialLoad = !queryParams.get("imp_uid");

    if (isSdkLoaded && dataValid && isInitialLoad) {
      requestPay();
    }

    if (!dataValid && isInitialLoad) {
      setStatusMessage(
        "결제에 필요한 정보가 부족하여 요청을 시작할 수 없습니다."
      );
      setIsError(true);
    }
  }, [isSdkLoaded, amount, somoimId, sessionId, userName]);

  // ────────────────────────────── 2. 결제 결과 처리 useEffect
  useEffect(() => {
    const imp_uid = queryParams.get("imp_uid");
    const merchant_uid = queryParams.get("merchant_uid");
    const imp_success = queryParams.get("imp_success");

    if (imp_uid && !isProcessingRef.current) {
      if (imp_success === "true") {
        setStatusMessage("결제 성공 확인. 서버에 최종 승인 요청 중...");

        sendPaymentDataToServer({
          imp_uid,
          merchant_uid,
          success: true,
        });

        // URL 정리: 중복 처리를 막기 위해 쿼리 파라미터를 제거
        navigate(location.pathname, { replace: true });
      } else {
        const error_msg =
          queryParams.get("error_msg") ||
          "결제를 취소했거나 오류가 발생했습니다.";
        console.error("❌ URL 파라미터에서 결제 실패 수신:", error_msg);
        setStatusMessage(`결제 실패: ${error_msg}`);
        setIsError(true);

        // URL 정리 및 이전 페이지로 이동
        navigate(location.pathname, { replace: true });
        setTimeout(() => navigate(-1, { replace: true }), 3000);
      }
    }
  }, [location.search]);

  // ────────────────────────────── Render

  return (
    <PageContainer>
      <h2>결제 처리 중</h2>
      <Instruction>잠시만 기다려주세요</Instruction>
      <Instruction>자동으로 결제 모듈로 이동합니다</Instruction>
      <StatusMessage $isError={isError}>{statusMessage}</StatusMessage>
    </PageContainer>
  );
};

export default PaymentPage;
