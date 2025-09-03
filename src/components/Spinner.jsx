import React from "react";
import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// transient props 사용 ($fullscreen, $thickness)
const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ $fullscreen }) =>
    $fullscreen &&
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.6);
    z-index: 9999;
  `}
`;

const SpinnerCircle = styled.div`
  border: ${({ $thickness }) => $thickness || "4px"} solid
    ${({ theme }) => theme.colors.lightGrey};
  border-top: ${({ $thickness }) => $thickness || "4px"} solid
    ${({ theme }) => theme.colors.mainBlue};
  border-radius: 50%;
  width: ${({ size }) => size || "40px"};
  height: ${({ size }) => size || "40px"};
  animation: ${spin} 1s linear infinite;
`;

const Spinner = ({ fullscreen, size, thickness }) => {
  return (
    <SpinnerWrapper $fullscreen={fullscreen}>
      <SpinnerCircle size={size} $thickness={thickness} />
    </SpinnerWrapper>
  );
};

Spinner.propTypes = {
  fullscreen: PropTypes.bool,
  size: PropTypes.string,
  thickness: PropTypes.string,
};

export default Spinner;
