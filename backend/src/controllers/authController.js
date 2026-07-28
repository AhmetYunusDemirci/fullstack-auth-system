const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // JWT kütüphanesi eklendi

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

    res.status(201).json({
      message: "User registered successfully.",
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

// Fonksiyonları dışa aktarma
module.exports = {
  register,
  login, // login buraya eklendi
};
