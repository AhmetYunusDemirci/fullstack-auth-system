const express = require("express");

const router = express.Router();

const {
  getUsers,
  getStats,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
  updateUserRole,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

router.use(protect);
router.use(isAdmin);

router.get("/stats", getStats);

router.get("/users", getUsers);

router.get("/users/:id", getUserById);

router.post("/users", createUser);

router.put("/users/:id", updateUser);

router.patch(
  "/users/:id/role",
  updateUserRole
);

router.delete(
  "/users/:id",
  deleteUser
);

module.exports = router;