const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

// İSTATİSTİKLER
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalNormalUsers = await User.countDocuments({
      role: "user",
    });

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalNormalUsers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
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

module.exports = {
  getUsers,
  getStats,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
  updateUserRole,
};