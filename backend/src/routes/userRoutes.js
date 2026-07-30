const express = require("express");

const router = express.Router();

const {
  getProfile,
  becomeSeller,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// Profil bilgilerini getir
router.get("/profile", protect, getProfile);

// Kullanıcıyı seller yap
router.patch("/become-seller", protect, becomeSeller);

module.exports = router;