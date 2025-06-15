// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Ссылка на пользователя
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Пользователь обязателен"]
  },

  // Товары в заказе
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Количество должно быть не меньше 1"]
      },
      price: {
        type: Number,
        required: true,
        min: [0, "Цена не может быть отрицательной"]
      }
    }
  ],

  // Общая сумма заказа
  total: {
    type: Number,
    required: true,
    min: [0, "Итоговая сумма не может быть отрицательной"]
  },

  // Номер заказа
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Дата создания
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Статус заказа (по желанию)
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
    default: "pending"
  }
});

// Модель Order
module.exports = mongoose.model("Order", orderSchema);