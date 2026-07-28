require("dotenv").config();
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const connectDB = require("./config/db");


const app = express();

// MongoDB bağlantısı
connectDB();

app.use("/api/dashboard", dashboardRoutes);

// Middleware
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});