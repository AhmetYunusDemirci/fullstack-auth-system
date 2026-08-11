const express = require("express");
const router = express.Router();
const { createOrder, getSellerOrders, updateSellerOrderStatus, getMyOrders } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const isSeller = require("../middleware/isSeller"); // Satıcı kontrolü

// Sadece giriş yapmış kullanıcılar sipariş oluşturabilir
router.post("/", protect, createOrder);

// Müşteri kendi siparişlerini görebilir
router.get("/my-orders", protect, getMyOrders);

// Sadece satıcılar (seller) kendi siparişlerini görebilir ve güncelleyebilir
router.get("/seller-orders", protect, isSeller, getSellerOrders);
router.patch("/:id/status/seller", protect, isSeller, updateSellerOrderStatus);

module.exports = router;