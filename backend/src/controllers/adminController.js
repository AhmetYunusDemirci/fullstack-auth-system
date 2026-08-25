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

// GELİŞMİŞ İSTATİSTİKLER (Dashboard Grafikleri İçin)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalNormalUsers = await User.countDocuments({ role: "user" });
    
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalOpenTickets = await ContactMessage.countDocuments({ status: "Open" });

    // --- YENİ: GÜNLÜK ZİYARETÇİ SİMÜLASYONU ---
    // (Gerçekte Google Analytics API veya Redis kullanılır, biz mantıklı bir simülasyon yapıyoruz)
    const baseVisitors = 150;
    const dailyVisitors = baseVisitors + Math.floor(Math.random() * (totalUsers * 2)); 

    // --- GRAFİK 1 İÇİN SİPARİŞ DURUMLARI (ORDER STATUS) ---
    const orderStatusDistribution = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);

    // --- YENİ: GRAFİK 2 (PASTA GRAFİK) İÇİN EN ÇOK SATAN KATEGORİLER ---
    const topCategories = await Product.aggregate([
      { $match: { sold: { $gt: 0 } } }, // Sadece satışı olan ürünleri al
      {
        $group: {
          _id: "$category",
          totalSold: { $sum: "$sold" } // Kategorideki tüm satışları topla
        }
      },
      { $sort: { totalSold: -1 } }, // En çok satandan aza doğru sırala
      { $limit: 5 }, // En iyi 5 kategoriyi al (Pasta grafiği çok karmaşık olmasın diye)
      { $project: { name: "$_id", value: "$totalSold", _id: 0 } } // Recharts formatına uygun hale getir
    ]);

    // Eğer hiç satış yoksa boş durmaması için varsayılan data gönderelim
    const finalTopCategories = topCategories.length > 0 ? topCategories : [
      { name: "Electronics", value: 10 }, { name: "Clothing", value: 5 }, { name: "Home", value: 2 }
    ];

    // --- GRAFİK 3 İÇİN AYLIK GELİR (REVENUE) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: "Delivered" } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedRevenue = monthlyRevenue.map(item => ({
      name: `${monthNames[item._id.month - 1]}`,
      revenue: item.revenue
    }));

    const finalRevenueData = formattedRevenue.length > 0 ? formattedRevenue : [
      { name: "Jan", revenue: 0 }, { name: "Feb", revenue: 0 }, { name: "Mar", revenue: 0 }
    ];

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalNormalUsers,
      totalProducts,
      totalOrders,
      totalOpenTickets,
      dailyVisitors, // YENİ
      topCategories: finalTopCategories, // YENİ: Pasta Grafik İçin
      orderStatusDistribution,
      monthlyRevenue: finalRevenueData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// KULLANICI OLUŞTUR
const createUser = async (req, res) => {
  try {
    const { name, surname, email, password, role } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // --- YENİ: UZUNLUK VE GÜVENLİK SINIRLAMALARI ---
    if (name.length > 50 || surname.length > 50) {
      return res.status(400).json({ message: "Name and surname cannot exceed 50 characters." });
    }
    
    if (email.length > 100) {
      return res.status(400).json({ message: "Email cannot exceed 100 characters." });
    }
    // -----------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(500).json({ message: "Server Error" });
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
    const { name, surname, email } = req.body;

    if (!name || !surname || !email) {
      return res.status(400).json({ message: "Name, surname and email are required." });
    }

    // --- YENİ: UZUNLUK VE GÜVENLİK SINIRLAMALARI ---
    if (name.length > 50 || surname.length > 50) {
      return res.status(400).json({ message: "Name and surname cannot exceed 50 characters." });
    }
    
    if (email.length > 100) {
      return res.status(400).json({ message: "Email cannot exceed 100 characters." });
    }
    // -----------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const emailOwner = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });

    if (emailOwner) {
      return res.status(400).json({ message: "Email already exists." });
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
    res.status(500).json({ message: "Server Error" });
  }
};

// ROLE DEĞİŞTİR
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // --- YENİ: "seller" rolü de geçerli roller arasına eklendi ---
    if (!["user", "seller", "admin"].includes(role)) {
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
    
    // --- YENİ: UZUNLUK VE MANTIKSAL SINIRLAMALAR ---
    if (name && name.length > 50) {
      return res.status(400).json({ message: "Product name cannot exceed 50 characters." });
    }
    
    if (category && category.length > 40) {
      return res.status(400).json({ message: "Category cannot exceed 40 characters." });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (numPrice < 0 || numPrice > 1000000) {
        return res.status(400).json({ message: "Price must be between 0 and 1,000,000." });
      }
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      // Stok negatif olamaz ve 100 binden fazla (mantıksız stok) olamaz
      if (numStock < 0 || numStock > 100000) {
        return res.status(400).json({ message: "Stock must be between 0 and 100,000." });
      }
    }
    // -----------------------------------------------

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