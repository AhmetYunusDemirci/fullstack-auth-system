const User = require("../models/User");

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

module.exports = {
  getProfile,
  becomeSeller,
};