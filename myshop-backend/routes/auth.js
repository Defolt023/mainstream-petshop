// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Подключаем middleware
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Временное хранилище кодов
const codes = {};

// === Роуты ===

// Отправка кода авторизации
router.post("/send-code", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Номер телефона обязателен" });
  }

  // Генерируем 6-значный код
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes[phone] = code;

  console.log(`[DEV] Код для ${phone}: ${code}`);
  res.json({ message: "Код отправлен", codeSent: true });
});

// Верификация кода
router.post("/verify-code", async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: "Телефон и код обязательны" });
  }

  if (codes[phone] !== code) {
    return res.status(400).json({ message: "Неверный код" });
  }

  // Ищем или создаём пользователя
  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone });
    await user.save();
  }

  // Генерируем JWT-токен
  const token = jwt.sign(
    { id: user._id, phone },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  delete codes[phone]; // очищаем код после использования

  res.json({
    token,
    user: {
      _id: user._id,
      phone: user.phone,
      name: user.name || "",
      role: user.role || "user"
    }
  });
});

router.get("/favorites", authMiddleware, async (req, res) => {
  await req.user.populate("favorites");
  res.json(req.user.favorites);
});

// Получить данные пользователя
router.get("/me", authMiddleware, async (req, res) => {
  await req.user.populate("favorites");
  res.json({
    _id: req.user._id,
    phone: req.user.phone,
    name: req.user.name || "",
    role: req.user.role || "user",
    favorites: req.user.favorites || []
  });
});

// Обновить имя пользователя
router.post("/update-name", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Имя должно быть строкой" });
  }

  req.user.name = name.trim();
  await req.user.save();

  res.json({ message: "Имя обновлено", name: req.user.name });
});

// Добавить/удалить из избранного
router.post("/favorites/:id", authMiddleware, async (req, res) => {
  const productId = req.params.id;
  const index = req.user.favorites.indexOf(productId);

  if (index === -1) {
    req.user.favorites.push(productId);
  } else {
    req.user.favorites.splice(index, 1);
  }

  await req.user.save();
  res.json({ message: "Изменения сохранены" });
});

module.exports = router;