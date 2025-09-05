// src/pages/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import theme from "../theme";
import SignupDonePage from "./SignupDonePage";
import Hing from "./Hing";
import SignupPage from "./SignupPage";
import MainPage from "./MainPage";
import Search from "./Search";
import ChatList from "./ChatList";
import Notifications from "./Notifications";
import MyPage from "./MyPage";
import AllPosts from "./AllPosts";
import CreatePost from "./CreatePost";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import { TabBar } from "../components";
import SigninPage from "./SigninPage";
import SigninWithEmailPage from "./SigninWithEmailPage";
import FindPwPage from "./FindPwPage";
import Layout from "../components/Layout";
import PostDetail from "./PostDetail";
import MyPostDetail from "./MyPostDetail";

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
          <Route path="/search" element={<Search />} />
          <Route path="/chatls" element={<ChatList />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/allposts" element={<AllPosts />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/postdetail/:postId" element={<PostDetail />} />
          <Route path="/mypostdetail/:postId" element={<MyPostDetail />} />
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
