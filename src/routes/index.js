import express from "express";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";
import orderRoutes from "./order.js";
import paymentRoutes from "./payment.js";
import productRoutes from "./product.js";
import userRoutes from "./user.js";

import { requireAuth } from "../middleware/middlewares.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/products", productRoutes);

router.use("/users", requireAuth, userRoutes);

export default router;
