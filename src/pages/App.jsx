// src/pages/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import theme from "../theme";
import SignupDonePage from "./SignupDonePage";
import Hing from "./Hing";
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
import { TabBar } from "../components";
import SigninPage from "./SigninPage";
import SigninWithEmailPage from "./SigninWithEmailPage";
import FindPwPage from "./FindPwPage";
import Layout from "../components/Layout";
import PostDetailPage from "./PostDetailPage";
import MyPostDetailPage from "./MyPostDetailPage";

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
  }
`;

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div style={{ paddingBottom: "20px" }}>
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chatls" element={<ChatListPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/allposts" element={<AllPostsPage />} />
          <Route path="/createpost" element={<CreatePostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/editprofile" element={<EditProfilePage />} />
          <Route path="/postdetail/:postId" element={<PostDetailPage />} />
          <Route path="/mypostdetail/:postId" element={<MyPostDetailPage />} />
          <Route path="/done" element={<SignupDonePage />} />
          <Route path="/hing" element={<Hing />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<SigninPage />} />
          <Route path="/signinwithemail" element={<SigninWithEmailPage />} />
          <Route path="/findpw" element={<FindPwPage />} />

          {/* 다른 라우트들을 여기에 추가하세요 */}
        </Routes>
      </div>
      <Layout />
    </ThemeProvider>
  );
};

export default App;
