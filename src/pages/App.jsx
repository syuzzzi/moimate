import React, { useEffect, useCallback } from "react";
import { messaging } from "../config/firebase-config";
import { getToken } from "firebase/messaging";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/useAuth";
import { Navigate } from "react-router-dom";

import theme from "../theme";
import SignupDonePage from "./SignupDonePage";
import Start from "./StartPage";
import SignupPage from "./SignupPage";
import MainPage from "./MainPage";
import SearchPage from "./SearchPage";
import ChatListPage from "./ChatListPage";
import NotificationsPage from "./NotificationsPage";
import MyPage from "./MyPage";
import AllPostsPage from "./AllPostsPage";
import CreatePostPage from "./CreatePostPage";
import ProfilePage from "./ProfilePage";
import EditProfilePage from "./EditProfilePage";
import SigninWithEmailPage from "./SigninWithEmailPage";
import FindPwPage from "./FindPwPage";
import Layout from "../components/Layout";
import PostDetailPage from "./PostDetailPage";
import MyPostDetailPage from "./MyPostDetailPage";
import ChatPage from "./ChatPage";
import EditPostPage from "./EditPostPage";
import CheckParticipantsPage from "./CheckParticipantsPage";
import PublicProfilePage from "./PublicProfilePage";
import ReviewFormPage from "./ReviewFormPage";
import PaymentPage from "./PaymentPage";
import ApplicationFormPage from "./ApplicationFormPage";
import ApplicationListPage from "./ApplicationListPage";
import ApplicationDecisionPage from "./ApplicationDecisionPage";
import DeleteAccountPage from "./DeleteAccountPage";
import FAQPage from "./FAQPage";
import { NotificationOverlayProvider } from "../components/NotificationOverlay.jsx";
import WebSocketManager from "../components/WebSocketManager.jsx";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "NanumSquare_acR";
    src: url("/fonts/NanumSquare_acR.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "NanumSquare_acB";
    src: url("/fonts/NanumSquare_acB.ttf") format("truetype");
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: "NanumSquare_acEB";
    src: url("/fonts/NanumSquare_acEB.ttf") format("truetype");
    font-weight: 800;
    font-style: normal;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: "NanumSquare_acR", sans-serif;
    overflow: hidden; /*전체 화면 스크롤 막기*/ 
  }
`;

const App = () => {
  const { isAuthenticated, user } = useAuth();

  /**
   * FCM 토큰을 요청하고 서버에 저장하는 함수
   * @param {string} uid 현재 로그인된 사용자의 ID
   */
  const requestPermissionAndGetToken = useCallback(async (uid) => {
    // 이미 권한이 부여되었는지 확인
    if (Notification.permission === "granted") {
      console.log("푸시 알림 권한 이미 승인됨. 토큰 발급 시도.");
    } else {
      console.log("푸시 알림 권한 요청 중...");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("⚠️ 푸시 알림 권한 거부됨. 토큰 발급 중단.");
        return;
      }
      console.log("✅ 푸시 알림 권한 승인됨.");
    }

    try {
      // FCM 토큰 발급 요청
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (token) {
        console.log(`✅ [${uid}] 사용자 FCM 토큰 발급 성공:`, token);

        // TODO: 발급된 토큰(token)과 현재 사용자 ID(uid)를 서버로 전송하여 저장하는 API 호출 로직 추가
        // 예시: await saveFCMTokenToServer(uid, token);
        // 성공적으로 저장되었는지 확인하는 로깅을 추가하세요.
      } else {
        console.log("❌ 토큰 발급에 실패했거나, 유효한 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("🚨 FCM 토큰 발급 중 오류 발생:", error);
    }
  }, []);

  // 1. 컴포넌트 마운트 시
  // 2. isAuthenticated 값이 true로 변경될 때 (로그인 성공 시)
  // 3. user.uid가 유효할 때 (사용자 정보가 로드될 때)
  useEffect(() => {
    // 💡 로그인 상태이고 사용자 ID가 있을 때만 토큰 발급 로직 실행
    if (isAuthenticated && user?.uid) {
      requestPermissionAndGetToken(user.uid);
    }
  }, [isAuthenticated, user?.uid, requestPermissionAndGetToken]); // 의존성 배열에 추가

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <NotificationOverlayProvider>
        <WebSocketManager />
        <Routes>
          {/* ✅ 로그인 상태와 관계없이 접근 가능한 라우트 */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/main" replace /> : <Start />
            }
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/done" element={<SignupDonePage />} />
          <Route path="/signinwithemail" element={<SigninWithEmailPage />} />
          <Route path="/findpw" element={<FindPwPage />} />
          <Route path="/allposts" element={<AllPostsPage />} />
          <Route path="/postdetail/:postId" element={<PostDetailPage />} />

          {/* ✅ 로그인 여부와 상관없이 접근 가능 + Layout 적용 */}
          <Route element={<Layout />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* ✅ 로그인 상태일 때만 접근 가능한 중첩 라우트 */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/chatls" element={<ChatListPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/createpost" element={<CreatePostPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/editprofile" element={<EditProfilePage />} />
            <Route
              path="/mypostdetail/:postId"
              element={<MyPostDetailPage />}
            />
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route path="/editpost/:postId" element={<EditPostPage />} />
            <Route
              path="/checkparticipants"
              element={<CheckParticipantsPage />}
            />
            <Route
              path="/publicprofile/:userId"
              element={<PublicProfilePage />}
            />
            <Route path="/review" element={<ReviewFormPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/applicationform" element={<ApplicationFormPage />} />
            <Route path="/applicationlist" element={<ApplicationListPage />} />
            <Route
              path="/applicationdecision"
              element={<ApplicationDecisionPage />}
            />
            <Route path="/deleteaccount" element={<DeleteAccountPage />} />
            <Route path="FAQ" element={<FAQPage />} />
          </Route>
        </Routes>
      </NotificationOverlayProvider>
    </ThemeProvider>
  );
};

export default App;
