// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Телефон обязателен"],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: "Телефон не может быть пустым"
    }
  },
  name: {
    type: String,
    trim: true,
    default: null
  },
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
    default: () => []
  },
  cart: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
    default: () => []
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
});

module.exports = mongoose.model("User", userSchema);