require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const connectDB = require("./config/db");

const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const couponRoutes = require("./routes/couponRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const app = express();

// MongoDB bağlantısı
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Ana route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Eski app.listen(...) kodunu sil, yerine bunu yapıştır:

const server = http.createServer(app);

// Socket.io Ayarları (CORS izni veriyoruz ki Frontend bağlanabilsin)
const io = new Server(server, {
  cors: {
    origin: "*", // Frontend URL'ini buraya yazabilirsin, şimdilik herkese açık
    methods: ["GET", "POST"]
  }
});

// io objesini diğer dosyalardan (controller'lardan) erişilebilir yapıyoruz!
app.set("io", io);

// --- CANLI ZİYARETÇİ SAYACI ---
let activeUsersCount = 0;

io.on("connection", (socket) => {
  activeUsersCount++; // Biri siteye girdiğinde sayıyı 1 artır
  console.log("🟢 Biri bağlandı. Aktif Kullanıcı:", activeUsersCount);
  
  // Tüm kullanıcılara (Admin paneline) güncel sayıyı canlı canlı fırlat
  io.emit("live_users_update", activeUsersCount);

  socket.on("disconnect", () => {
    activeUsersCount--; // Biri siteden çıktığında sayıyı 1 azalt
    console.log("🔴 Biri çıktı. Aktif Kullanıcı:", activeUsersCount);
    
    // Çıkış olduğunda da güncel sayıyı yayınla
    io.emit("live_users_update", activeUsersCount);
  });
});
// -----------------------------

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});