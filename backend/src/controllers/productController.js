const Product = require("../models/Product");

// TÜM ÜRÜNLERİ GETİR
// TÜM ÜRÜNLERİ GETİR (SERVER-SIDE ARAMA DESTEKLİ)
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    // Temel sorgu objesi (Eğer filtre yoksa tüm ürünleri getirir)
    let query = {};

    // 1. Kategori Filtresi
    if (category && category !== "All") {
      // Büyük/küçük harf duyarlılığını kaldırmak için regex
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

    const products = await Product.find(query)
      .populate("seller", "name surname email")
      .sort({ createdAt: -1 });

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

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative.",
      });
    }

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

    product.name = name ?? product.name;
    product.description =
      description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    // Image boş gönderilebilir
    product.image = image ?? product.image;

    product.category =
      category ?? product.category;

    if (Number(product.price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative.",
      });
    }

    if (Number(product.stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative.",
      });
    }

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

module.exports = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};