import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// TouchableOpacity를 button 태그로 대체합니다.
const ButtonContainer = styled.button`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.grey : theme.colors.mainBlue};
  padding: 12px 16px;
  margin: 10px 0;
  display: flex; // flexbox를 사용해 아이템을 중앙에 정렬합니다.
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  height: 50px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  border: none;
  width: 100%; // React Native의 컨테이너처럼 너비 전체를 차지하도록 설정
`;

const ButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  color: ${({ theme, style }) => (style && style.color) || theme.colors.white};
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
      <ButtonText style={textStyle}>{title}</ButtonText>
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
