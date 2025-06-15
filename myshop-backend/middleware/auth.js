// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Проверяем наличие заголовка Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  // Извлекаем токен
  const token = authHeader.split(" ")[1];

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Находим пользователя
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    // Делаем user доступным в роутах
    req.user = user;
    req.token = token;
    next();

  } catch (err) {
    console.error("Ошибка проверки токена:", err.message);
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};