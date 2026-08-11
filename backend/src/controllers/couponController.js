const Coupon = require("../models/Coupon");

// 1. KUPON DOĞRULAMA (Müşteriler sepette kullanacak)
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: "Coupon code is required." });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code." });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active." });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired." });
    }

    res.status(200).json({
      message: "Coupon applied successfully!",
      discountPercentage: coupon.discountPercentage,
      code: coupon.code
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. KUPON OLUŞTURMA (Admin için - Test amaçlı kullanacağız)
const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDays } = req.body;
    
    // expiryDays parametresi ile kaç gün geçerli olacağını belirliyoruz
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    const coupon = await Coupon.create({
      code,
      discountPercentage,
      expiryDate,
    });

    res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// TÜM KUPONLARI GETİR (Admin İçin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// KUPON SİL (Admin İçin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json({ message: "Coupon deleted successfully." });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  deleteCoupon,
};