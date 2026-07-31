const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

// Kullanıcının sepetini getir
router.get("/", protect, getCart);

// Sepete ürün ekle
router.post("/", protect, addToCart);

// Sepetten ürün sil
router.delete("/:productId", protect, removeFromCart);

// Ürün adedini güncelle
router.put("/:productId", protect, updateCartItem);

module.exports = router;