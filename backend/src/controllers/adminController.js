const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ContactMessage = require("../models/ContactMessage");

// TÜM KULLANICILARI GETİR
const getUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 5 } = req.query;

    const currentPage = Number(page);
    const currentLimit = Number(limit);

    const skip = (currentPage - 1) * currentLimit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { surname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalUsers = await User.countDocuments(searchQuery);

    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit);

    const totalPages = Math.ceil(totalUsers / currentLimit);

    res.status(200).json({
      users,
      totalUsers,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// İSTATİSTİKLER (GÜNCELLENDİ)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalNormalUsers = await User.countDocuments({ role: "user" });
    
    // Yeni İstatistikler
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalOpenTickets = await ContactMessage.countDocuments({ status: "Open" });

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalNormalUsers,
      totalProducts,
      totalOrders,
      totalOpenTickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// KULLANICI OLUŞTUR
const createUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      role,
    } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message:
          "Please enter a valid email address.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
 
// KULLANICI DETAYI
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// kul sil
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete yourself.",
      });
    }

    await User.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "User deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// KULLANICI GÜNCELLE
const updateUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
    } = req.body;

    if (!name || !surname || !email) {
      return res.status(400).json({
        message: "Name, surname and email are required.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message:
          "Please enter a valid email address.",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const emailOwner = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });

    if (emailOwner) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    user.name = name;
    user.surname = surname;
    user.email = email;

    await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ROLE DEĞİŞTİR
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      message: "User role updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// -----------------------------------------
// E-TİCARET YÖNETİM FONKSİYONLARI (YENİ)
// -----------------------------------------

// TÜM ÜRÜNLERİ GETİR
const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email").sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ÜRÜN SİL
const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// TÜM SİPARİŞLERİ GETİR
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SİPARİŞ DURUMUNU GÜNCELLE
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: "Order not found." });
    
    order.status = status;
    await order.save();
    
    res.status(200).json({ message: "Order status updated.", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// TÜM DESTEK TALEPLERİNİ GETİR
const getAdminMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// TALEBİN DURUMUNU GÜNCELLE
const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) return res.status(404).json({ message: "Message not found." });
    
    message.status = status;
    await message.save();
    
    res.status(200).json({ message: "Message status updated.", contactMessage: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
// ÜRÜN GÜNCELLE (ADMİN - Herhangi bir ürünü güncelleyebilir)
const updateAdminProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.category = category ?? product.category;

    await product.save();

    res.status(200).json({ message: "Product updated successfully.", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
  getUsers,
  getStats,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
  updateUserRole,
  // Yeni eklenenler:
  getAdminProducts,
  deleteAdminProduct,
  updateAdminProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminMessages,
  updateMessageStatus,
};