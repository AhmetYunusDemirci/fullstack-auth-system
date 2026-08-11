const Iyzipay = require("iyzipay");
const iyzipay = require("../config/iyzipay");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const processPayment = async (req, res) => {
  try {
    const { addressForm, cardForm } = req.body;

    // 1. Kullanıcıyı ve Sepetini getir
    const user = await User.findById(req.user.id);
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 2. Sepet tutarını hesapla ve Iyzico basketItems formatına çevir (Fiyat Backend'den!)
    let totalPrice = 0;
    const basketItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;

      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
      }

      const itemTotalPrice = item.product.price * item.quantity;
      totalPrice += itemTotalPrice;

      basketItems.push({
        id: item.product._id.toString(),
        name: item.product.name,
        category1: item.product.category || "General",
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: itemTotalPrice.toString(), // Iyzico string bekler
      });
    }

    if (totalPrice === 0) {
      return res.status(400).json({ message: "Invalid cart total." });
    }

    // 3. Iyzico Ödeme İsteği Nesnesi (Request Object)
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: "Order_" + Date.now(),
      price: totalPrice.toString(),
      paidPrice: totalPrice.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: "1",
      basketId: cart._id.toString(),
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: cardForm.cardHolderName,
        cardNumber: cardForm.cardNumber.replace(/\s/g, ""), // Boşlukları temizle
        expireMonth: cardForm.expireMonth,
        expireYear: cardForm.expireYear,
        cvc: cardForm.cvc,
        registerCard: "0",
      },
      buyer: {
        id: user._id.toString(),
        name: user.name,
        surname: user.surname,
        gsmNumber: "+905555555555", // Test ortamı için sabit
        email: user.email,
        identityNumber: "11111111111", // Test ortamı için zorunlu TC formatı
        lastLoginDate: "2023-10-10 10:10:10",
        registrationDate: "2023-10-10 10:10:10",
        registrationAddress: addressForm.address,
        ip: "85.34.78.112", // Güvenlik için dummy IP
        city: addressForm.city,
        country: addressForm.country,
        zipCode: addressForm.postalCode,
      },
      shippingAddress: {
        contactName: `${user.name} ${user.surname}`,
        city: addressForm.city,
        country: addressForm.country,
        address: addressForm.address,
        zipCode: addressForm.postalCode,
      },
      billingAddress: {
        contactName: `${user.name} ${user.surname}`,
        city: addressForm.city,
        country: addressForm.country,
        address: addressForm.address,
        zipCode: addressForm.postalCode,
      },
      basketItems: basketItems,
    };

    // 4. Iyzico'ya Ödeme İsteğini Gönder
    iyzipay.payment.create(request, async (err, result) => {
      if (err) {
        console.error("Iyzico Service Error:", err);
        return res.status(500).json({ message: "Payment service unavailable." });
      }

      // Iyzico'dan dönen cevap BAŞARILI ise:
      if (result.status === "success") {
        
        // 5. Sipariş (Order) nesnesini oluştur ve Stokları düş
        const orderItems = [];
        
        for (const item of cart.items) {
          if (!item.product) continue;
          
          orderItems.push({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image || "",
          });
          
          // Gerçek stok düşüm işlemi!
          item.product.stock -= item.quantity;
          await item.product.save();
        }

        const newOrder = new Order({
          user: req.user.id,
          orderItems,
          shippingAddress: addressForm,
          totalPrice,
          isPaid: true,
          paidAt: Date.now(),
          status: "Processing", // Ödendiği için direkt işleniyor'a geçiyor
        });

        await newOrder.save();

        // 6. İşlem bitti, Sepeti boşalt
        cart.items = [];
        await cart.save();

        return res.status(200).json({
          message: "Payment completed successfully!",
          order: newOrder,
        });

      } else {
        // Ödeme başarısız ise (Limit yetersiz, kart hatalı vs.) Iyzico'nun hata mesajını döndür
        return res.status(400).json({
          message: result.errorMessage || "Payment failed. Please check your card details.",
        });
      }
    });

  } catch (error) {
    console.error("Payment Processing Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  processPayment,
};