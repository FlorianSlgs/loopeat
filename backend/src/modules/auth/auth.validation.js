const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCode = (code) => {
  return /^\d{4}$/.test(code);
};

const validatePassword = (password) => {
  // Vérifier si le mot de passe existe et fait au moins 8 caractères
  if (!password || password.length < 8) {
    return false;
  }
  
  // Vérifier la présence d'une majuscule
  const hasUpperCase = /[A-Z]/.test(password);
  
  // Vérifier la présence d'une minuscule
  const hasLowerCase = /[a-z]/.test(password);
  
  // Vérifier la présence d'un chiffre
  const hasNumber = /[0-9]/.test(password);
  
  // Vérifier la présence d'un caractère spécial
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Retourner true seulement si toutes les conditions sont remplies
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

module.exports = {
  validateEmail,
  validateCode,
  validatePassword
};