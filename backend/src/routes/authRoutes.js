const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.put("/reset-password/:token", resetPassword);

router.post("/login", login);

router.post("/register", register);

router.post("/forgot-password", forgotPassword);

module.exports = router;