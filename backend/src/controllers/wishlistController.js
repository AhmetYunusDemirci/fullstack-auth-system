const Wishlist = require("../models/Wishlist");

// 1. KULLANICININ FAVORİLERİNİ GETİR
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate("products");
    
    // Eğer kullanıcının henüz bir wishlist'i yoksa boş bir tane oluştur
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json({ wishlist });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. FAVORİLERE ÜRÜN EKLE VEYA ÇIKAR (TOGGLE MANTIĞI)
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    // Ürün zaten favorilerde var mı kontrol et
    const isLiked = wishlist.products.includes(productId);

    if (isLiked) {
      // Varsa çıkar
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    } else {
      // Yoksa ekle
      wishlist.products.push(productId);
    }

    await wishlist.save();
    
    // Frontend'in resmi/fiyatı görebilmesi için product bilgilerini doldurup (populate) gönder
    await wishlist.populate("products"); 

    res.status(200).json({ 
      message: isLiked ? "Removed from wishlist" : "Added to wishlist", 
      wishlist 
    });
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};