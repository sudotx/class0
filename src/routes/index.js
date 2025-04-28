import express from "express";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";
import orderRoutes from "./order.js";
import productRoutes from "./product.js";
import userRoutes from "./user.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;
