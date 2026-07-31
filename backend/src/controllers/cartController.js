const Cart = require("../models/Cart");
const Product = require("../models/Product");

// SEPETİ GETİR
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    res.status(200).json({
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// SEPETE ÜRÜN EKLE
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    const requestedQuantity = Number(quantity) || 1;

    if (requestedQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product is out of stock.",
      });
    }

    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items are available.`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      if (requestedQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items are available.`,
        });
      }

      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
      });
    }

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// SEPETTEN ÜRÜN SİL
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      message: "Product removed from cart.",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// SEPETTEKİ ÜRÜN ADEDİNİ GÜNCELLE
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const newQuantity = Number(quantity);

    if (!newQuantity || newQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items are available.`,
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product is not in the cart.",
      });
    }

    item.quantity = newQuantity;

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      message: "Cart updated successfully.",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
};