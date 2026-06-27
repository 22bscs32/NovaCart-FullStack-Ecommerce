const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

  const userResponse = {
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isAdmin: user.isAdmin,
};

res.status(201).json({
  message: "User registered successfully",
  user: userResponse,
});
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  const userResponse = {
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isAdmin: user.isAdmin,
};

res.json({
  message: "Login successful",
  token,
  user: userResponse,
});
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;