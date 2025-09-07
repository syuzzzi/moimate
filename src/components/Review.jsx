import React from "react";
import styled from "styled-components";
import { Star } from "react-feather";
import PropTypes from "prop-types";

const Container = styled.div`
  margin-top: 8px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const StarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`;

const StarText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.mainblue};
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.extraBold};
  margin-left: 5px;
  margin-top: 0;
  margin-bottom: 0;
`;

const Content = styled.p`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #000;
  margin-top: 5px;
  margin-bottom: 2px;
`;

const DateText = styled.p`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #999;
  margin-top: 4px;
  margin-bottom: 2px;
`;

const Review = ({ star, sentence, createdAt }) => {
  return (
    <Container>
      <StarContainer>
        <Star size={18} color="#FFC107" />
        <StarText>{star}</StarText>
      </StarContainer>
      <Content>{sentence}</Content>
      <DateText>{createdAt}</DateText>
    </Container>
  );
};

Review.propTypes = {
  star: PropTypes.number.isRequired,
  sentence: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
};

export default Review;
