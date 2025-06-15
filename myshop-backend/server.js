// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// === Подключение статики (важно: должно быть до роутов)
app.use("/uploads", express.static("uploads"));

// === Настройка CORS
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
  exposedHeaders: ["Content-Type", "Authorization"]
}));

// === Парсинг JSON
app.use(express.json());

// === Telegram Бот
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log("✅ Telegram бот запущен");

  // Приветственное сообщение при /start
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Добро пожаловать в *Мейнстрим*!\nВы будете получать уведомления о новых заказах.", {
      parse_mode: "Markdown"
    });
  });

  // Лог ошибок
  bot.on("polling_error", (err) => {
    console.error("Telegram polling error:", err.message);
  });
} else {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN или CHAT_ID не заданы в .env");
}

// === Подключение роутов
try {
  const productRoutes = require("./routes/products");
  const authRoutes = require("./routes/auth");
  const cartRoutes = require("./routes/cart");
  const checkoutRoutes = require("./routes/checkout");
  const orderRoutes = require("./routes/order"); // ✅ Теперь точно подключены

  // Роуты API
  app.use("/api/products", productRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/checkout", checkoutRoutes);
  app.use("/api/orders", orderRoutes); // ✅ Должен быть именно таким
  app.use("/api/auth", require("./routes/contact")); // или так: app.use("/api/contact", require("./routes/contact"));

  console.log("✅ Все роуты загружены");

} catch (err) {
  console.error("❌ Ошибка импорта роутов:", err.message);
  process.exit(1);
}

// === MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB подключена");

    // Запуск сервера после успешного подключения к БД
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Сервер запущен на порту ${process.env.PORT || 3000}`);
    });

  })
  .catch((err) => {
    console.error("❌ Ошибка подключения MongoDB:", err.message);
    process.exit(1); // Завершаем процесс при ошибке БД
  });