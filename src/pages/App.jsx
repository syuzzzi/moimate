// src/pages/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
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

const App = () => {
  return (
    <ThemeProvider theme={theme}>
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
          <Route path="/done" element={<SignupDonePage />} />
          <Route path="/hing" element={<Hing />} />
          <Route path="/" element={<SignupPage />} />

          {/* 다른 라우트들을 여기에 추가하세요 */}
        </Routes>
      </div>
      <TabBar />
    </ThemeProvider>
  );
};

export default App;
