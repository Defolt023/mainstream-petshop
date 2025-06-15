// routes/cart.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// Получить корзину пользователя
router.get("/", authMiddleware, async (req, res) => {
  try {
    await req.user.populate("cart");
    res.json(req.user.cart || []);
  } catch (err) {
    console.error("Ошибка загрузки корзины:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавить товар в корзину
router.post("/add/:id", authMiddleware, async (req, res) => {
  const productId = req.params.id;

  try {
    // Убеждаемся, что cart — массив
    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    if (!req.user.cart.includes(productId)) {
      req.user.cart.push(productId);
      await req.user.save();
    }

    await req.user.populate("cart");
    res.json(req.user.cart);

  } catch (err) {
    console.error("Ошибка добавления в корзину:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удалить товар из корзины
router.post("/remove/:id", authMiddleware, async (req, res) => {
  const productId = req.params.id;

  try {
    req.user.cart = req.user.cart?.filter(id => id.toString() !== productId) || [];
    await req.user.save();
    await req.user.populate("cart");

    res.json(req.user.cart);

  } catch (err) {
    console.error("Ошибка удаления из корзины:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Очистить корзину
router.post("/clear", authMiddleware, async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();

    res.json({ message: "Корзина очищена", cart: [] });

  } catch (err) {
    console.error("Ошибка очистки корзины:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;