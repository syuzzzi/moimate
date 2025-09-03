import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// ✅ TouchableOpacity를 button 태그로 대체
const Container = styled.button`
  background-color: transparent;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;

  // ✅ 부모로부터 받은 스타일을 적용합니다.
  ${(props) => props.style}
`;

// ✅ Title을 span 태그로 대체
const Title = styled.span`
  font-size: 15px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.mainBlue};
  text-decoration: underline;

  // ✅ 부모로부터 받은 스타일을 적용합니다.
  ${(props) => props.style}
`;

const LostPw = ({ title, onClick, containerStyle, textStyle }) => {
  return (
    <Container onClick={onClick} style={containerStyle}>
      <Title style={textStyle}>{title}</Title>
    </Container>
  );
};

LostPw.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  textStyle: PropTypes.object,
};

export default LostPw;
