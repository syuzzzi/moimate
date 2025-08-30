// src/components/HingPage.jsx

import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
  color: #333;
  font-family: Arial, sans-serif;
`;

const Text = styled.h1`
  font-size: 100px;
  font-weight: bold;
`;

const Hing = () => {
  return (
    <Container>
      <Text>hing</Text>
    </Container>
  );
};

export default Hing;
