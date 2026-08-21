const Product = require("../models/Product");
const Order = require("../models/Order")
const User = require("../models/User");
// TÜM ÜRÜNLERİ GETİR
// TÜM ÜRÜNLERİ GETİR (GELİŞMİŞ FİLTRELEME VE SIRALAMA DESTEKLİ)
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, sort, seller } = req.query;
    
    // Temel sorgu objesi
    let query = {};

    // --- YENİ: SATICI (SELLER) FİLTRESİ ---
    if (seller) {
      query.seller = seller;
    }
    

    // 1. Kategori Filtresi
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // 2. Arama Kelimesi Filtresi (Name, Description, Category)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // 3. FİYAT ARALIĞI FİLTRESİ (Min ve Max)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice); // Greater than or equal (Büyük Eşit)
      if (maxPrice) query.price.$lte = Number(maxPrice); // Less than or equal (Küçük Eşit)
    }

    // 4. STOK DURUMU FİLTRESİ (Sadece stokta olanları getir)
    if (inStock === "true") {
      query.stock = { $gt: 0 }; // Sıfırdan büyük olanlar
    }

    // 5. SIRALAMA (SORTING) MANTIĞI
    let sortOption = { createdAt: -1 }; // Varsayılan: En yeniler (Newest)
    
    if (sort === "price_asc") sortOption = { price: 1 }; // Fiyat: Düşükten Yükseğe
    if (sort === "price_desc") sortOption = { price: -1 }; // Fiyat: Yüksekten Düşüğe
    if (sort === "oldest") sortOption = { createdAt: 1 }; // En eskiler

    const products = await Product.find(query)
      .populate("seller", "name surname email")
      .sort(sortOption);

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Products could not be loaded.",
    });
  }
};

// TEK ÜRÜNÜ GETİR
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name surname email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Product could not be loaded.",
    });
  }
};

// YENİ ÜRÜN OLUŞTUR
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image,
      category,
    } = req.body;

    // Zorunlu alanlar
    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Name, description, price, stock and category are required.",
      });
    }

    // --- YENİ: UZUNLUK VE GÜVENLİK KONTROLLERİ (API SEVİYESİ) ---
    if (name.length > 100) {
      return res.status(400).json({
        message: "Product name cannot exceed 100 characters.",
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        message: "Description cannot exceed 2000 characters.",
      });
    }
    // -------------------------------------------------------------

    // --- YENİ: KATEGORİ, FİYAT VE STOK SINIRLAMALARI ---
    if (category && category.length > 50) {
      return res.status(400).json({
        message: "Category cannot exceed 50 characters.",
      });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (numPrice < 0 || numPrice > 1000000) {
        return res.status(400).json({
          message: "Price must be between $0 and $1,000,000.",
        });
      }
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (!Number.isInteger(numStock) || numStock < 0 || numStock > 100000) {
        return res.status(400).json({
          message: "Stock must be a whole number between 0 and 100,000.",
        });
      }
    }
    // --- YENİ: GÖRSEL UZANTISI KONTROLÜ (API) ---
    if (image && image.trim() !== "") {
      const imageRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
      if (!imageRegex.test(image.trim())) {
        return res.status(400).json({
          message: "Invalid image URL. Must end with a valid image extension (.jpg, .png, .webp, etc.).",
        });
      }
    }
    
    // ----------------------------------------------------

    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),

      // Image artık opsiyonel
      image: image || "",

      category,

      // Ürünü oluşturan seller
      seller: req.user.id,
    });

    await product.save();

    const createdProduct = await Product.findById(product._id)
      .populate("seller", "name surname email");

    res.status(201).json({
      message: "Product created successfully.",
      product: createdProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Product could not be created.",
      error: error.message,
    });
  }
};

// ÜRÜNÜ GÜNCELLE
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Sadece ürün sahibi değiştirebilir
    if (
      product.seller.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only update your own products.",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      image,
      category,
    } = req.body;

    // --- YENİ: UZUNLUK VE GÜVENLİK KONTROLLERİ (API SEVİYESİ) ---
    // Eğer name gönderildiyse ve 100 karakterden uzunsa engelle
    if (name && name.length > 100) {
      return res.status(400).json({
        message: "Product name cannot exceed 100 characters.",
      });
    }

    // Eğer description gönderildiyse ve 2000 karakterden uzunsa engelle
    if (description && description.length > 2000) {
      return res.status(400).json({
        message: "Description cannot exceed 2000 characters.",
      });
    }
    // -------------------------------------------------------------

    product.name = name ?? product.name;
    product.description =
      description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    // Image boş gönderilebilir
    product.image = image ?? product.image;

    product.category =
      category ?? product.category;

    // --- YENİ: KATEGORİ, FİYAT VE STOK SINIRLAMALARI ---
    if (category && category.length > 50) {
      return res.status(400).json({
        message: "Category cannot exceed 50 characters.",
      });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (numPrice < 0 || numPrice > 1000000) {
        return res.status(400).json({
          message: "Price must be between $0 and $1,000,000.",
        });
      }
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (!Number.isInteger(numStock) || numStock < 0 || numStock > 100000) {
        return res.status(400).json({
          message: "Stock must be a whole number between 0 and 100,000.",
        });
      }
    }
    // --- YENİ: GÖRSEL UZANTISI KONTROLÜ (API) ---
    if (image && image.trim() !== "") {
      const imageRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
      if (!imageRegex.test(image.trim())) {
        return res.status(400).json({
          message: "Invalid image URL. Must end with a valid image extension (.jpg, .png, .webp, etc.).",
        });
      }
    }
    
    // ----------------------------------------------------

    await product.save();

    const updatedProduct = await Product.findById(
      product._id
    ).populate(
      "seller",
      "name surname email"
    );

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Product could not be updated.",
    });
  }
};

// ÜRÜNÜ SİL
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Sadece kendi ürününü silebilir
    if (
      product.seller.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own products.",
      });
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Product could not be deleted.",
    });
  }
};

// SELLER'IN KENDİ ÜRÜNLERİNİ GETİR
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(
      "Get my products error:",
      error
    );

    res.status(500).json({
      message: "Seller products could not be loaded.",
    });
  }
};
// YENİ YORUM EKLE (Sadece Doğrulanmış Satın Alımlar)
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) return res.status(400).json({ message: "Rating and comment are required." });
    if (comment.trim().length > 500) return res.status(400).json({ message: "Comment cannot exceed 500 characters." });
    if (Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: "Rating must be between 1 and 5." });

    const sanitizedComment = comment.replace(/<[^>]*>?/gm, '');

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user.id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: "You have already reviewed this product." });

    const hasBought = await Order.findOne({
      user: req.user.id,
      status: "Delivered",
      "orderItems.product": productId
    });

    if (!hasBought) {
      return res.status(403).json({ message: "You can only review products you have purchased and received (Delivered)." });
    }

    // --- YENİ: KULLANICININ ADINI VERİTABANINDAN ÇEKİYORUZ ---
    const reviewer = await User.findById(req.user.id);
    const reviewerName = reviewer ? `${reviewer.name} ${reviewer.surname}` : "Verified Buyer";
    // ---------------------------------------------------------

    const review = {
      name: reviewerName, // Artık undefined değil, "Ahmet Demirci" gibi gelecek
      rating: Number(rating),
      comment: sanitizedComment,
      user: req.user.id,
    };

    product.reviews.push(review);
    
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully!" });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// YORUM DÜZENLE (Kullanıcının Sadece Kendi Yorumunu Düzenlemesi)
const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // 1. Validasyonlar
    if (!rating || !comment) return res.status(400).json({ message: "Rating and comment are required." });
    if (comment.trim().length > 500) return res.status(400).json({ message: "Comment cannot exceed 500 characters." });
    if (Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: "Rating must be between 1 and 5." });

    // 2. XSS (Sanitization) Koruması
    const sanitizedComment = comment.replace(/<[^>]*>?/gm, '');

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // 3. Kullanıcının yorumunu ürün içindeki diziden bul
    const reviewIndex = product.reviews.findIndex((r) => r.user.toString() === req.user.id.toString());
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: "You have not reviewed this product yet." });
    }

    // 4. Verileri Güncelle
    product.reviews[reviewIndex].rating = Number(rating);
    product.reviews[reviewIndex].comment = sanitizedComment;
    
    // 5. Yeni Ortalamayı Yeniden Hesapla
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(200).json({ message: "Review updated successfully!" });
  } catch (error) {
    console.error("Update Review Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// YORUMU FAYDALI BUL (Beğen / Beğeniyi Geri Çek)
const toggleReviewLike = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // 1. İlgili yorumu ürünün içinden bul
    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });

    // 2. Kullanıcı bu yorumu daha önce beğenmiş mi kontrol et
    const userId = req.user.id.toString();
    const hasLiked = review.likes.includes(userId);

    // 3. Beğenmişse çıkar (Unlike), Beğenmemişse ekle (Like)
    if (hasLiked) {
      review.likes.pull(userId); // Beğeniyi geri çek
    } else {
      review.likes.push(userId); // Beğen
    }

    await product.save();

    res.status(200).json({ 
      message: hasLiked ? "Like removed" : "Review liked", 
      likes: review.likes 
    });
  } catch (error) {
    console.error("Toggle Review Like Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SATICININ YORUMA CEVAP VERMESİ
const replyToProductReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const { id, reviewId } = req.params;

    // 1. Validasyonlar
    if (!reply || reply.trim().length === 0) return res.status(400).json({ message: "Reply cannot be empty." });
    if (reply.trim().length > 1000) return res.status(400).json({ message: "Reply cannot exceed 1000 characters." });

    // 2. XSS (Sanitization) Koruması (HTML etiketlerini siler)
    const sanitizedReply = reply.replace(/<[^>]*>?/gm, '');

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // 3. MANTIKSAL GÜVENLİK KONTROLÜ: İsteği yapan kişi, bu ürünün GERÇEK satıcısı mı?
    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Security Error: Only the seller of this product can reply to reviews." });
    }

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });

    // 4. Cevabı yorum objesine ekle
    review.sellerReply = {
      comment: sanitizedReply,
      repliedAt: Date.now()
    };

    await product.save();

    res.status(200).json({ message: "Seller reply added successfully!" });
  } catch (error) {
    console.error("Seller Reply Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// SATICININ ÜRÜNLERİNE GELEN TÜM YORUMLARI GETİR (Review Dashboard)
const getSellerReviews = async (req, res) => {
  try {
    // 1. Sadece bu satıcıya ait ürünleri bul (İsim, resim ve yorumları getir)
    const products = await Product.find({ seller: req.user.id }).select('name image reviews');
    
    let allReviews = [];

    // 2. Her ürünün içindeki yorumları döngüye al ve düz bir listeye çevir
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          ...review.toObject(), // Mongoose objesini normal JS objesine çevir
          productName: product.name,
          productId: product._id,
          productImage: product.image
        });
      });
    });

    // 3. Tarihe göre en yeniden en eskiye sırala
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ reviews: allReviews });
  } catch (error) {
    console.error("Get Seller Reviews Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// [ADMIN] TÜM YORUMLARI VE İSTATİSTİKLERİ GETİR
const getAdminReviews = async (req, res) => {
  try {
    // Güvenlik: Sadece Admin girebilir
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied. Admins only." });

    const products = await Product.find().select('name image reviews');
    
    let allReviews = [];
    let totalRating = 0;
    let fiveStarCount = 0;

    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          ...review.toObject(),
          productName: product.name,
          productId: product._id,
          productImage: product.image
        });
        totalRating += review.rating;
        if (review.rating === 5) fiveStarCount++;
      });
    });

    // En yeni yorumlar en üstte
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Admin İstatistikleri
    const stats = {
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0,
      fiveStarRatio: allReviews.length > 0 ? Math.round((fiveStarCount / allReviews.length) * 100) : 0
    };

    res.status(200).json({ reviews: allReviews, stats });
  } catch (error) {
    console.error("Admin Get Reviews Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// [ADMIN] KÖTÜ NİYETLİ YORUMU SİL
const deleteAdminReview = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied." });

    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // Yorumun index'ini bul
    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    if (reviewIndex === -1) return res.status(404).json({ message: "Review not found." });

    // Yorumu diziden çıkar (Sil)
    product.reviews.splice(reviewIndex, 1);

    // Yeni ortalamaları hesapla
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0 
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length 
      : 0;

    await product.save();

    res.status(200).json({ message: "Review deleted successfully by Admin." });
  } catch (error) {
    console.error("Admin Delete Review Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
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
};