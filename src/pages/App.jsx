import React from "react";
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
import SigninPage from "./SigninPage";
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
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
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
        <Route path="/signin" element={<SigninPage />} />
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
          <Route path="/mypostdetail/:postId" element={<MyPostDetailPage />} />
          <Route path="/chat/:roomId" element={<ChatPage />} />
          <Route path="/editpost/:postId" element={<EditPostPage />} />
          <Route
            path="/checkparticipants"
            element={<CheckParticipantsPage />}
          />{" "}
          <Route
            path="/publicprofile/:userId"
            element={<PublicProfilePage />}
          />
          <Route path="/review" element={<ReviewFormPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
