import React from "react";
import styled from "styled-components";
import { ThemeProvider } from "styled-components";
import theme from "../theme";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fff;
  color: #333;
  font-family: ${({ theme }) => theme.fonts.extraBold};
`;

const Text = styled.h1`
  font-size: 100px;
  font-weight: bold;
`;

const Hing = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Text>hing</Text>
      </Container>
    </ThemeProvider>
  );
};

export default Hing;
