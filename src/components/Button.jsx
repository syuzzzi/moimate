import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const ButtonContainer = styled.button`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.grey : theme.colors.mainBlue};
  padding: ${({ $style }) => ($style?.padding ? $style.padding : "12px 16px")};
  width: ${({ $style }) => ($style?.width ? $style.width : "100%")};
  height: ${({ $style }) => ($style?.height ? $style.height : "50px")};
  border-radius: ${({ $style }) =>
    $style?.borderRadius ? $style.borderRadius : "5px"};
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  border: none;
`;

const ButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ $textStyle }) => ($textStyle && $textStyle.fontSize) || 20}px;
  color: ${({ theme, $textStyle }) =>
    ($textStyle && $textStyle.color) || theme.colors.white};
`;

// Title 컴포넌트는 button 내부에 직접 스타일을 적용하여 제거합니다.
// 아이콘이 있을 경우에만 사용합니다.
const IconWrapper = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const Button = ({ title, onClick, disabled, icon, style, textStyle }) => {
  return (
    <ButtonContainer onClick={onClick} disabled={disabled} style={style}>
      {/* 아이콘이 존재할 때만 렌더링 */}
      {icon && <IconWrapper src={icon} alt="icon" />}
      <ButtonText $textStyle={textStyle}>{title}</ButtonText>
    </ButtonContainer>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired, // onPress 대신 onClick
  disabled: PropTypes.bool,
  icon: PropTypes.string, // 이미지 소스 경로를 받습니다.
  style: PropTypes.object,
  textStyle: PropTypes.object,
};

export default Button;
