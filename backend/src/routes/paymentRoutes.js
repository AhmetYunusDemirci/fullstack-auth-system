const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

// Ödeme sadece giriş yapmış kullanıcılar tarafından yapılabilir
router.post("/", protect, processPayment);

module.exports = router;