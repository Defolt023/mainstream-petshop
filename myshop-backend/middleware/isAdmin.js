// middleware/isAdmin.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Проверяем заголовок
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Нет токена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещён для вашей роли" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Ошибка проверки админа:", err.message);
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};