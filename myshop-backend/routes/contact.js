// routes/contact.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer"); // для отправки писем

// Роут для получения сообщения от пользователя
router.post("/send-message", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  try {
    // Настройка транспорта для отправки писем
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.SUPPORT_EMAIL || "info@mainstream-pets.ru",
      subject: `[Контакт-форма] ${subject}`,
      html: `
        <h3>Новое сообщение</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Тема:</strong> ${subject}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
      `
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    // Логируем в консоль
    console.log(`📩 Сообщение от ${email} (${subject}) успешно отправлено`);

    res.json({ message: "Сообщение отправлено!" });
  } catch (err) {
    console.error("❌ Не удалось отправить сообщение:", err.message);
    res.status(500).json({ message: "Не удалось отправить сообщение" });
  }
});

module.exports = router;