const express = require("express");

const router = express.Router();

const {
  getProfile,
  becomeSeller,
  updateProfile, // Buraya updateProfile import edildi
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// Profil bilgilerini getir
router.get("/profile", protect, getProfile);

// Profil bilgilerini güncelle
router.put("/profile", protect, updateProfile); // Yeni eklenen rota

// Kullanıcıyı seller yap
router.patch("/become-seller", protect, becomeSeller);

module.exports = router;