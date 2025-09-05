import React from "react";
import styled from "styled-components";
import { Star } from "react-feather";

const ReviewContainer = styled.div`
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  margin-bottom: 10px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const StarText = styled.p`
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
  color: ${({ theme }) => theme.colors.black};
`;

const Sentence = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.grey};
  line-height: 1.4;
  margin-bottom: 8px;
`;

const DateText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.lightGrey};
`;

const Review = ({ star, sentence, createdAt }) => {
  return (
    <ReviewContainer>
      <Header>
        <Star size={16} color="#FFC107" />
        <StarText>{star}</StarText>
      </Header>
      <Sentence>{sentence}</Sentence>
      <DateText>{createdAt}</DateText>
    </ReviewContainer>
  );
};

export default Review;
