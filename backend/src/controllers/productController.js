const Product = require("../models/Product");

// TÜM ÜRÜNLERİ GETİR
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
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
    } = req.body;

    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "All required fields must be filled.",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative.",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative.",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      image: image || "",
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

    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can only update your own products.",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      image,
    } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.image = image ?? product.image;

    if (product.price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative.",
      });
    }

    if (product.stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative.",
      });
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("seller", "name surname email");

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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own products.",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};