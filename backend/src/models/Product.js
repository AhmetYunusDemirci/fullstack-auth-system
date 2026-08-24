const mongoose = require("mongoose");

// --- YENİ: YORUM (REVIEW) ŞEMASI ---
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sellerReply: {
      comment: { type: String, maxlength: 1000, trim: true },
      repliedAt: { type: Date }
    }
  },
  { timestamps: true }
);
// ------------------------------------

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a product name"], trim: true, maxlength: [100, "Product name cannot exceed 100 characters"] },
    description: { type: String, required: [true, "Please add a description"], maxlength: [2000, "Description cannot exceed 2000 characters"] },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: {
      type: Number,
      default: 0,
    },
    image: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // --- YENİ: ÜRÜN PUANLAMA ALANLARI ---
    reviews: [reviewSchema], // Yorumların tutulacağı dizi
    rating: { type: Number, required: true, default: 0 }, // Genel yıldız ortalaması
    numReviews: { type: Number, required: true, default: 0 }, // Toplam yorum sayısı
    // ------------------------------------
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);