import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// `styled.Text`는 웹에서 `styled.p` 또는 `styled.span`으로 대체합니다.
const StyledText = styled.p`
  width: 100%;
  height: 17px;
  color: ${({ theme }) => theme.colors.red};
  font-size: 13px;
  font-family: ${({ theme }) => theme.fonts.regular};
  z-index: 999;
  margin: 0; // p 태그의 기본 여백 제거
`;

const ErrorMessage = ({ message }) => {
  return <StyledText>{message}</StyledText>;
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;
