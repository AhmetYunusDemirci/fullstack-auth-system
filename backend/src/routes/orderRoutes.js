const express = require("express");
const router = express.Router();
const { createOrder, getSellerOrders, updateSellerOrderStatus, getMyOrders } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const isSeller = require("../middleware/isSeller"); // Satıcı kontrolü
const { requestOrderReturn, processOrderReturn } = require("../controllers/orderController");

// Müşteri iade talep eder
router.post("/:id/return", protect, requestOrderReturn);

// Satıcı iadeyi onaylar/reddeder
// Satıcı veya Admin iadeyi onaylar/reddeder
// DİKKAT: isSeller kaldırıldı, çünkü processOrderReturn içinde yetki kontrolü yapıyoruz!
router.put("/:id/return-process", protect, processOrderReturn);
// Sadece giriş yapmış kullanıcılar sipariş oluşturabilir
router.post("/", protect, createOrder);

// Müşteri kendi siparişlerini görebilir
router.get("/my-orders", protect, getMyOrders);

// Sadece satıcılar (seller) kendi siparişlerini görebilir ve güncelleyebilir
router.get("/seller-orders", protect, isSeller, getSellerOrders);
router.patch("/:id/status/seller", protect, isSeller, updateSellerOrderStatus);

module.exports = router;