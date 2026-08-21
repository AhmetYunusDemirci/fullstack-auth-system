const express = require("express");

const router = express.Router();

const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  toggleReviewLike,
  replyToProductReview,
  getSellerReviews,
  getAdminReviews,
  deleteAdminReview,
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
  getMyProducts,
  getSellerReviews,
);
// Satıcı, tüm ürünlerine gelen yorumları tek bir yerde görür
router.get("/seller/reviews", protect, isSeller, getSellerReviews);

// --- ADMIN MODERASYON ROTALARI ---
router.get("/admin/all-reviews", protect, getAdminReviews);
router.delete("/admin/reviews/:productId/:reviewId", protect, deleteAdminReview);
// ---------------------------------

// Herkes tek ürünü görebilir
router.get("/:id", getProductById);
// Herhangi bir kullanıcı ürüne yorum yapabilir (İçeride satın alma kontrolü var)
router.post("/:id/reviews", protect, createProductReview);
// Sadece kendi yorumunu düzenleyebilir
router.put("/:id/reviews", protect, updateProductReview);
// Satıcı yoruma cevap verebilir (İçeride kendi ürünü mü diye kontrol var)
router.post("/:id/reviews/:reviewId/reply", protect, isSeller, replyToProductReview);

// Yorumu faydalı bulma (Like/Unlike)
router.post("/:id/reviews/:reviewId/like", protect, toggleReviewLike);

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