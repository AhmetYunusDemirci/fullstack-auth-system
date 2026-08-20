const User = require("../models/User");
const bcrypt = require("bcryptjs");

// KULLANICI PROFİLİNİ GETİR
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// KULLANICIYI SELLER YAP
const becomeSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin cannot become a seller.",
      });
    }

    if (user.role === "seller") {
      return res.status(400).json({
        message: "You are already a seller.",
      });
    }

    user.role = "seller";

    await user.save();

    res.status(200).json({
      message: "You are now a seller.",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Become seller error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// KULLANICI PROFİLİNİ GÜNCELLE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const { name, surname, email, password } = req.body;

    // --- BACKEND API UZUNLUK SINIRLAMALARI ---

    if (name && name.length > 35) {
      return res.status(400).json({
        message: "Name cannot exceed 35 characters.",
      });
    }

    if (surname && surname.length > 35) {
      return res.status(400).json({
        message: "Surname cannot exceed 35 characters.",
      });
    }

    if (email && email.length > 70) {
      return res.status(400).json({
        message: "Email cannot exceed 70 characters.",
      });
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters.",
        });
      }

      if (password.length > 30) {
        return res.status(400).json({
          message: "Password cannot exceed 30 characters.",
        });
      }
    }

    // ------------------------------------------

    // Email'i güncellemek istiyorsa ve email değişmişse
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          message: "Email is already in use.",
        });
      }

      user.email = email;
    }

    // Ad ve soyad güncelleme
    user.name = name || user.name;
    user.surname = surname || user.surname;

    // Şifre güncellemek istiyorsa
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Güncellenmiş kullanıcıyı şifresiz olarak dön
    const updatedUser = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getProfile,
  becomeSeller,
  updateProfile, // Bunu ekledik
};