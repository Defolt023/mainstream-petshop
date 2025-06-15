// routes/order.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Order = require("../models/Order");

// Получить все заказы пользователя
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "products",
        populate: { path: "product", model: "Product" }
      })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error("Ошибка загрузки истории:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;