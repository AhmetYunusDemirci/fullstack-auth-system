const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// SİPARİŞ OLUŞTUR (Checkout)
const createOrder = async (req, res) => {
  try {
    const { address, city, postalCode, country } = req.body;

    // 1. Gelen adres bilgilerini kontrol et
    if (!address || !city || !postalCode || !country) {
      return res.status(400).json({ message: "Shipping address is fully required." });
    }

    // 2. Kullanıcının sepetini bul
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 3. Sipariş Kalemlerini (Order Items) Hazırla ve Fiyatı Hesapla
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      // Eğer ürün veritabanından silinmişse (null ise) atla
      if (!item.product) continue;

      // Ürünün stoğu var mı kontrol et
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}` 
        });
      }

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image || "",
      });

      totalPrice += item.product.price * item.quantity;
      
      // Ürünün stoğunu düş
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "Invalid products in cart." });
    }

    // 4. Yeni Siparişi Oluştur ve Veritabanına Kaydet
    const newOrder = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress: { address, city, postalCode, country },
      totalPrice,
      isPaid: true, // Şimdilik varsayılan olarak ödendi kabul ediyoruz
      paidAt: Date.now(),
    });

    await newOrder.save();

    // 5. Sepeti Boşalt (Checkout olduğu için)
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SATICININ KENDİ SİPARİŞLERİNİ GETİR
const getSellerOrders = async (req, res) => {
  try {
    // 1. Satıcının kendi ürünlerinin ID'lerini bul
    const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
    const productIds = sellerProducts.map(p => p._id);

    // 2. İçinde bu satıcının ürünlerinden HERHANGİ BİRİ olan siparişleri getir
    const orders = await Order.find({
      "orderItems.product": { $in: productIds }
    }).populate("user", "name surname email").sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get Seller Orders Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SATICI SİPARİŞ DURUMU GÜNCELLE
const updateSellerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found." });

    // GÜVENLİK: Bu siparişte gerçekten bu satıcının ürünü var mı?
    const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
    const productIds = sellerProducts.map(p => p._id.toString());
    
    const hasSellerProduct = order.orderItems.some(item => 
      productIds.includes(item.product.toString())
    );

    if (!hasSellerProduct) {
      return res.status(403).json({ message: "You don't have permission to update this order." });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated.", order });
  } catch (error) {
    console.error("Update Seller Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// MÜŞTERİNİN KENDİ SİPARİŞLERİNİ GETİR
const getMyOrders = async (req, res) => {
  try {
    // Giriş yapan kullanıcının ID'sine ait siparişleri bul
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // En yeni sipariş en üstte görünsün

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  createOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getMyOrders, // Bunu ekledik
};