import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const StyledText = styled.p`
  width: 100%;
  height: 20px;
  color: ${({ theme }) => theme.colors.red};
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  z-index: 999;
  margin: 0;

  // ✅ 메시지가 없으면 투명하게 만듭니다.
  opacity: ${({ $hasMessage }) => ($hasMessage ? 1 : 0)};
  transition: opacity 0.3s;

  // ✅ 부모 컴포넌트에서 전달받은 스타일을 적용합니다.
  ${(props) => props.style}
`;

const ErrorMessage = ({ message, style }) => {
  return (
    <StyledText style={style} $hasMessage={!!message}>
      {message}
    </StyledText>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  // ✅ style 프롭 타입을 추가합니다.
  style: PropTypes.object,
};

export default ErrorMessage;
