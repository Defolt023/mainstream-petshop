// routes/checkout.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order"); // ✅ Теперь используем модель Order
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

router.post("/", authMiddleware, async (req, res) => {
  const { name, phone, paymentMethod } = req.body;

  if (!name || !phone || !paymentMethod) {
    return res.status(400).json({ message: "Заполните все поля" });
  }

  try {
    const user = req.user;

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Корзина пуста" });
    }

    // Получаем товары из корзины
    const products = await Product.find({ _id: { $in: user.cart } });

    // Уменьшаем количество на складе
    for (const product of products) {
      if (product.stock > 0) {
        product.stock -= 1;
        await product.save();
      }
    }

    // Формируем список товаров для заказа
    const orderItems = products.map(p => ({
      product: p._id,
      quantity: 1, // можно потом сделать динамически
      price: p.price
    }));

    // Общая сумма заказа
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Генерируем номер заказа
    const orderNumber = `#${Date.now().toString().slice(-6)}`;

    // Создаём новый заказ в БД
    const newOrder = new Order({
      user: user._id,
      products: orderItems,
      total,
      orderNumber,
      paymentMethod
    });

    await newOrder.save();

    // Очищаем корзину пользователя
    user.cart = [];
    await user.save();

    // Отправляем в Telegram
    const orderText = `
🔔 Новый заказ!

👤 Имя: ${name}
📞 Телефон: ${phone}
💳 Способ оплаты: ${paymentMethod === "cash_or_card_on_delivery" ? "Наличными / Картой при получении" : "Картой онлайн"}
📦 Товары:
${products.map(p => `- ${p.name} (${p.price} ₽)`).join("\n")}
💰 Итого: ${total} ₽
🔢 Номер заказа: ${orderNumber}
`;

    if (bot) {
      await bot.sendMessage(TELEGRAM_CHAT_ID, orderText);
    }

    // Возвращаем ответ клиенту
    res.json({
      ok: true,
      orderNumber,
      message: "Заказ оформлен",
    });

  } catch (err) {
    console.error("Ошибка оформления заказа:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;