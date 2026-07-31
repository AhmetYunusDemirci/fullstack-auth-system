const express = require("express");

const router = express.Router();

const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const isSeller = require("../middleware/isSeller");

// Herkes ürünleri görebilir
router.get("/", getProducts);

// Seller sadece kendi ürünlerini görebilir
router.get(
  "/my-products",
  protect,
  isSeller,
  getMyProducts
);

// Herkes tek ürünü görebilir
router.get("/:id", getProductById);

// Sadece seller ürün ekleyebilir
router.post(
  "/",
  protect,
  isSeller,
  createProduct
);

// Sadece kendi ürününü güncelleyebilir
router.put(
  "/:id",
  protect,
  isSeller,
  updateProduct
);

// Sadece kendi ürününü silebilir
router.delete(
  "/:id",
  protect,
  isSeller,
  deleteProduct
);

module.exports = router;