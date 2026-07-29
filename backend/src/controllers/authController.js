const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// KAYIT OLMA FONKSİYONU
const register = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    // Boş alan kontrolü
    if (!name || !surname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    // Email daha önce kayıtlı mı?
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
    });

    // Veritabanına kaydet
    await newUser.save();
    const token = jwt.sign(
  {
    id: newUser._id,
    email: newUser.email,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
   );

    res.status(201).json({
  message: "User registered successfully.",
  token,
});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GİRİŞ YAPMA FONKSİYONU
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Alan kontrolü
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    // JWT oluştur
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ŞİFREMİ UNUTTUM FONKSİYONU
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Rastgele token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash'lenmiş token'ı veritabanına kaydet
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 10 dakika geçerli olsun
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

const html = `
    <h2>Password Reset</h2>

    <p>You requested a password reset.</p>

    <p>
      <a href="${resetUrl}">
        Click here to reset your password
      </a>
    </p>

    <p>This link will expire in 10 minutes.</p>
`;

await sendEmail({
  email: user.email,
  subject: "Password Reset",
  html,
});

res.status(200).json({
  message: "Password reset email sent successfully.",
});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// YENİ ŞİFRE BELİRLEME FONKSİYONU
const resetPassword = async (req, res) => {
  try {
    const resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token.",
      });
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successful.",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
   
};

// DASHBOARD
const getDashboard = async (req, res) => {
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
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getDashboard,
};
