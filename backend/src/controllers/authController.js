const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

module.exports = {
  register,
};