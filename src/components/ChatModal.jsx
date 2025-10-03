import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// ────────────────────────────── Styled
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.3s ease;
`;

const ModalBox = styled.div`
  width: min(280px, 90%);
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transform: scale(${({ $visible }) => ($visible ? 1 : 0.95)});
  transition: transform 0.3s ease;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.extraBold};
  font-size: 18px;
  margin-bottom: 12px;
  text-align: center;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  margin-top: 10px;
`;

const Input = styled.input`
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 4px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #333;
  -webkit-appearance: none;
  -moz-appearance: textfield;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
`;

const ConfirmButton = styled(ModalButton)`
  background-color: ${({ theme }) => theme.colors.mainBlue};
  color: #fff;
`;

const CancelButton = styled(ModalButton)`
  background-color: #ddd;
  color: #333;
`;

// ────────────────────────────── Component
const ChatModal = ({
  visible,
  formDate,
  setFormDate,
  formTime,
  setFormTime,
  formPrice,
  setFormPrice,
  formLocation,
  setFormLocation,
  onConfirm,
  onCancel,
}) => {
  if (!visible) {
    return null;
  }

  const handleDateChange = (e) => {
    setFormDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setFormTime(e.target.value);
  };

  return (
    <ModalOverlay $visible={visible}>
      <ModalBox $visible={visible} onClick={(e) => e.stopPropagation()}>
        <Title>모임 정보 입력</Title>

        <Label htmlFor="date-input">날짜</Label>
        <Input
          type="date"
          id="date-input"
          value={formDate}
          onChange={handleDateChange}
        />

        <Label htmlFor="time-input">시간</Label>
        <Input
          type="time"
          id="time-input"
          value={formTime}
          onChange={handleTimeChange}
        />

        <Label htmlFor="price-input">보증금 (숫자)</Label>
        <Input
          type="number"
          id="price-input"
          value={formPrice}
          onChange={(e) => setFormPrice(e.target.value)}
        />

        <Label htmlFor="location-input">장소</Label>
        <Input
          type="text"
          id="location-input"
          value={formLocation}
          onChange={(e) => setFormLocation(e.target.value)}
        />

        <ButtonRow>
          <CancelButton onClick={onCancel}>취소</CancelButton>
          <ConfirmButton onClick={onConfirm}>주최</ConfirmButton>
        </ButtonRow>
      </ModalBox>
    </ModalOverlay>
  );
};

ChatModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  formDate: PropTypes.string.isRequired,
  setFormDate: PropTypes.func.isRequired,
  formTime: PropTypes.string.isRequired,
  setFormTime: PropTypes.func.isRequired,
  formPrice: PropTypes.string.isRequired,
  setFormPrice: PropTypes.func.isRequired,
  formLocation: PropTypes.string.isRequired,
  setFormLocation: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ChatModal;
