// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Цена не может быть отрицательной"]
  },
  category: {
    type: String,
    required: true,
    enum: ["sets", "rations", "drying", "accessories"],
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Количество не может быть меньше нуля"],
    default: 1
  }
});

module.exports = mongoose.model("Product", productSchema);