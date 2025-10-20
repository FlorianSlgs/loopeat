const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCode = (code) => {
  return /^\d{4}$/.test(code);
};

const validatePassword = (password) => {
  // Au moins 8 caractères
  return password && password.length >= 8;
};

module.exports = {
  validateEmail,
  validateCode,
  validatePassword
};