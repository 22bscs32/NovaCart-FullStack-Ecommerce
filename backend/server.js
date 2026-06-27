
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("🚀 CodeAlpha E-commerce Backend is Running...");
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Database Connection Error:", err.message);
  });