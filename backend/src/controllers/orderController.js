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

    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price stock image seller sold" 
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 3. Sipariş Kalemlerini (Order Items) Hazırla ve Fiyatı Hesapla
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      if (!item.product) continue;

      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock...` });
      }

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image || "",
      });

      totalPrice += item.product.price * item.quantity;
      
      // BÜTÜN SIR BURADA! (Buranın böyle olduğundan emin ol)
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { 
            stock: -item.quantity, // Stoğu düşür
            sold: item.quantity    // Satışı artır (Aldığı miktar kadar)
          }
        }
      );
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

    // --- YENİ: SATICIYA CANLI BİLDİRİM (SOCKET.IO) FIRLATMA ---
    const io = req.app.get("io"); // Server.js'de kaydettiğimiz io objesini alıyoruz
    if (io) {
      // Hangi satıcıların ürünleri satıldıysa onların ID'lerini benzersiz (Set) olarak topla
      const uniqueSellers = [...new Set(cart.items.map(i => i.product?.seller?.toString()).filter(Boolean))];
      
      uniqueSellers.forEach(sellerId => {
        io.emit(`seller_notification_${sellerId}`, {
          message: "🎉 Tebrikler! Bir ürününüz az önce satıldı!",
          orderId: newOrder._id
        });
      });
    }
    // -----------------------------------------------------------

    res.status(201).json({
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SATICININ KENDİ SİPARİŞLERİNİ VE FİNANSAL İSTATİSTİKLERİNİ GETİR
const getSellerOrders = async (req, res) => {
  try {
    // 1. Satıcının kendi ürünlerinin ID'lerini bul
    const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
    const productIds = sellerProducts.map(p => p._id.toString());

    // 2. İçinde bu satıcının ürünlerinden HERHANGİ BİRİ olan siparişleri getir
    const orders = await Order.find({
      "orderItems.product": { $in: productIds }
    }).populate("user", "name surname email").sort({ createdAt: -1 });

    // --- YENİ: SATICIYA ÖZEL FİNANSAL HESAPLAMALAR ---
    let totalRevenue = 0;
    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    const monthlyData = {};

    orders.forEach(order => {
      // Bekleyen ve Teslim Edilen Sipariş Sayıları
      if (order.status === "Pending" || order.status === "Processing") pendingOrdersCount++;
      if (order.status === "Delivered") deliveredOrdersCount++;

      // Satıcının sadece KENDİ ürünlerinden elde ettiği geliri hesapla
      let orderSellerRevenue = 0;
      order.orderItems.forEach(item => {
        if (productIds.includes(item.product.toString())) {
          // Sadece Teslim edilmiş siparişlerin parası satıcının cebine girer
          if (order.status === "Delivered") {
            orderSellerRevenue += (item.price * item.quantity);
          }
        }
      });
      totalRevenue += orderSellerRevenue;

      // Grafik için Aylık Dağılım
      if (order.status === "Delivered" && orderSellerRevenue > 0) {
        const date = new Date(order.createdAt);
        const month = date.toLocaleString('en-US', { month: 'short' }); // Jan, Feb, Mar...
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month] += orderSellerRevenue;
      }
    });

    // Grafik verisini Recharts formatına çevir
    const chartData = Object.keys(monthlyData).map(key => ({ name: key, revenue: monthlyData[key] }));
    const finalChartData = chartData.length > 0 ? chartData : [{name: "No Data", revenue: 0}];
    // ---------------------------------------------------

    res.status(200).json({ 
      orders,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount,
        deliveredOrdersCount
      },
      chartData: finalChartData
    });
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

// MÜŞTERİ İADE TALEBİ OLUŞTURMA
const requestOrderReturn = async (req, res) => {
  try {
    const { reason } = req.body;

    // GÜVENLİK: İade nedeni 250 karakterden uzun olamaz!
    if (reason && reason.length > 250) {
      return res.status(400).json({ message: "İade nedeni en fazla 250 karakter olabilir." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found." });
    
    // Güvenlik: Sadece siparişin sahibi iade edebilir
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    // Sadece teslim edilmiş ürünler iade edilebilir
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "You can only return delivered orders." });
    }

    // Zaten bir iade talebi var mı?
    if (order.returnRequest && order.returnRequest.status !== 'None') {
      return res.status(400).json({ message: "A return request already exists for this order." });
    }

    // İade talebini kaydet
    order.returnRequest = {
      status: 'Pending',
      reason: reason || "No specific reason provided.",
      requestedAt: Date.now()
    };

    await order.save();

    res.status(200).json({ message: "Return request submitted successfully.", order });
  } catch (error) {
    console.error("Return Request Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// SATICI/ADMIN İADE TALEBİNİ YANITLAMA (Approve/Reject)
const processOrderReturn = async (req, res) => {
  try {
    const { returnStatus } = req.body; // 'Approved', 'Rejected' veya 'Refunded'
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Satıcı güvenlik kontrolü: Bu siparişte bu satıcının ürünü var mı? (Önceki updateSellerOrderStatus mantığıyla aynı)
    const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
    const productIds = sellerProducts.map(p => p._id.toString());
    const hasSellerProduct = order.orderItems.some(item => productIds.includes(item.product.toString()));

    if (!hasSellerProduct && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You don't have permission to process this return." });
    }

    order.returnRequest.status = returnStatus;
    await order.save();

    res.status(200).json({ message: `Return request marked as ${returnStatus}.`, order });
  } catch (error) {
    console.error("Process Return Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getMyOrders, // Bunu ekledik
  requestOrderReturn, // Müşteri iade talebi
  processOrderReturn, // Satıcı/Admin iade talebini işleme
};