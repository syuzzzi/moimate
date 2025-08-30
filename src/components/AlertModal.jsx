import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// Modal 대신 `div`와 CSS 속성으로 구현합니다.
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.3s ease-in-out;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
`;

const ModalBox = styled.div`
  width: 280px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(${({ $visible }) => ($visible ? 1 : 0.95)});
  transition: transform 0.3s ease-in-out;
`;

const Message = styled.p`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
  line-height: 22px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.mainBlue};
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: white;
  font-size: 16px;

  &:last-child {
    margin-left: 10px;
  }
`;

const CancelButton = styled(StyledButton)`
  background-color: #ddd;
  color: #333;
`;

const AlertModal = ({ visible, message, onConfirm, onCancel = null }) => {
  if (!visible) {
    return null;
  }

  return (
    <ModalOverlay $visible={visible}>
      <ModalBox $visible={visible}>
        <Message>{message}</Message>
        <ButtonRow>
          {onCancel && <CancelButton onClick={onCancel}>취소</CancelButton>}
          <StyledButton onClick={onConfirm}>확인</StyledButton>
        </ButtonRow>
      </ModalBox>
    </ModalOverlay>
  );
};

AlertModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default AlertModal;
