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
  getAdminProducts,
  deleteAdminProduct,
  updateAdminProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminMessages,
  updateMessageStatus
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
// --- YENİ E-TİCARET ROTALARI ---

// Ürünler
router.get("/products", getAdminProducts);
router.delete("/products/:id", deleteAdminProduct);
router.put("/products/:id", updateAdminProduct); // Bunu ekledik

// Siparişler
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Destek Talepleri
router.get("/messages", getAdminMessages);
router.patch("/messages/:id/status", updateMessageStatus);

module.exports = router;