import axios from "axios";
import express from "express";
import getPaginationData from "../utils/paginate.js";

const router = express.Router();

import User from "../models/user.js";
import handleErrors from "../utils/errorHandler.js";

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: user });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Get all users with pagination
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const { currentPage, itemsPerPage, skip, totalPages } = getPaginationData(
      req.query.page,
      req.query.limit,
      totalUsers
    );

    const users = await User.find().skip(skip).limit(itemsPerPage);

    return res.json({
      users,
      currentPage,
      totalPages,
      totalUsers,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Create new user
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = new User({ name, email, password });
    const savedUser = await user.save();
    return res.json({ message: savedUser });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Initialize Paystack payment
router.post("/:id/payment/initialize", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amount = 10000; // Amount in kobo (₦100.00)
    const email = user.email;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        amount,
        email,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({ message: "Error initializing payment" });
  }
});

// Verify Paystack payment
router.get("/:id/payment/verify", async (req, res) => {
  try {
    const { reference } = req.query;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      user.hasPaid = true;
      user.paymentReference = reference;
      user.paymentDate = new Date();
      await user.save();

      return res.json({
        message: "Payment verified successfully",
        user: user,
      });
    }

    return res.status(400).json({ message: "Payment verification failed" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ message: "Error verifying payment" });
  }
});

export default router;
