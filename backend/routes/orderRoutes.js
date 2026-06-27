const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// Create order
router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Order failed",
      error: error.message,
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error getting orders",
      error: error.message,
    });
  }
});

module.exports = router;