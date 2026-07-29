const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  createUser,
  getAdminStats,
} = require("../controllers/adminController");

router.post("/users", protect, isAdmin, createUser);

router.put("/users/:id", protect, isAdmin, updateUser);

router.get("/", protect, isAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin Panel",
  });
});

router.delete("/users/:id", protect, isAdmin, deleteUser);
router.patch("/users/:id/role", protect, isAdmin, changeUserRole);
router.get("/stats", protect, isAdmin, getAdminStats);
router.get("/users", protect, isAdmin, getAllUsers);

module.exports = router;