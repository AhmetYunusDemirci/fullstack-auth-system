const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getDashboard,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

router.get("/dashboard", protect, getDashboard);

module.exports = router;