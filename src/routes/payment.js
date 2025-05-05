import axios from "axios";
import express from "express";

const router = express.Router();

import User from "../models/user.js";

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
