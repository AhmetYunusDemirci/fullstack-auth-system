const express = require("express");
const router = express.Router();
const { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } = require("../controllers/couponController");
const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// Doğrulama rotası (Ödeme sırasında herkes erişebilir)
router.post("/validate", validateCoupon);

// ADMIN ROTALARI (Sadece yetkili admin erişebilir)
router.post("/create", protect, isAdmin, createCoupon);
router.get("/", protect, isAdmin, getAllCoupons);
router.delete("/:id", protect, isAdmin, deleteCoupon);

module.exports = router;