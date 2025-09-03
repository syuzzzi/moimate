export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const removeWhitespace = (text) => {
  const regex = /\s/g;
  return text.replace(regex, "");
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  const [hour, minute] = timeString.split(":");
  return `${hour} : ${minute}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.replace(/-/g, " / ");
};
