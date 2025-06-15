// routes/products.js
const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const Product = require("../models/Product");

// Подключение multer только для POST-запросов
const multer = require("multer");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Добавить товар
router.post("/", isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Изображение обязательно" });
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description || "",
      price: parseFloat(req.body.price),
      category: req.body.category,
      stock: parseInt(req.body.stock),
      image: `/uploads/${req.file.filename}`
    });

    await product.save();
    res.status(201).json(product);

  } catch (err) {
    console.error("Ошибка добавления товара:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получить все товары
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получить товар по ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Товар не найден" });
    res.json(product);
  } catch (err) {
    console.error("Ошибка загрузки товара:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновить товар
router.patch("/:id", isAdmin, async (req, res) => {
  const allowedFields = ["name", "description", "price", "category", "stock", "image"];
  const updateFields = {};

  for (const field of Object.keys(req.body)) {
    if (allowedFields.includes(field)) {
      if (field === "price" && !isNaN(parseFloat(req.body.price))) {
        updateFields.price = parseFloat(req.body.price);
      } else if (field === "stock" && !isNaN(parseInt(req.body.stock))) {
        updateFields.stock = parseInt(req.body.stock);
      } else {
        updateFields[field] = req.body[field];
      }
    }
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Товар не найден" });

    Object.assign(product, updateFields);
    await product.save();

    res.json(product);

  } catch (err) {
    console.error("Ошибка обновления товара:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удалить товар
router.delete("/:id", isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Товар не найден" });

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Товар удалён" });
});

module.exports = router;