import React, { useState, forwardRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0;
  width: 100%;
`;
const Label = styled.label`
  font-size: 15px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.grey};
  font-family: ${({ theme }) => theme.fonts.regular};
`;
const StyledInput = styled.input`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  padding: 10px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  border: 1px solid
    ${({ theme, isFocused }) =>
      isFocused ? theme.colors.mainBlue : theme.colors.grey};
  border-radius: 5px;
  height: 30px;

  // input 포커스 시 outline 제거
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.mainBlue};
  }

  // placeholder 스타일링
  &::placeholder {
    color: ${({ theme }) => theme.colors.grey};
    font-family: ${({ theme }) => theme.fonts.regular};
  }

  // multiline 속성을 사용하지 않는 경우
  ${({ multiline }) =>
    multiline &&
    `
    min-height: 100px;
    resize: vertical;
  `}
`;

// 웹 환경에서 multiline은 <textarea>로 처리하는 것이 일반적입니다.
const StyledTextArea = styled.textarea`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  padding: 10px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  border: 1px solid
    ${({ theme, $isFocused }) =>
      $isFocused ? theme.colors.mainBlue : theme.colors.grey};
  border-radius: 5px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.mainBlue};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey};
    font-family: ${({ theme }) => theme.fonts.regular};
  }
`;

const Input = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onKeyDown, // 웹에서는 onSubmitEditing 대신 onKeyDown을 사용합니다.
      placeholder,
      maxLength,
      isPassword,
      disabled,
      style,
      multiline = false,
      rows,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // multiline 여부에 따라 Input 컴포넌트를 분기 처리
    const InputComponent = multiline ? StyledTextArea : StyledInput;

    return (
      <Container style={style}>
        {label && <Label>{label}</Label>}
        <InputComponent
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          autoCapitalize="none"
          autoCorrect="off" // 'false' 대신 'off'
          type={isPassword ? "password" : "text"}
          $isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={disabled} // disabled 대신 readOnly
          rows={multiline ? rows : undefined}
        />
      </Container>
    );
  }
);

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string, // 비워진 상태를 위해 isRequired 제거
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  isPassword: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
};

export default Input;
