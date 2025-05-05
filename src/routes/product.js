import express from "express";
import { checkRole } from "../middleware/middlewares.js";
import Product from "../models/product.js";
import handleErrors from "../utils/errorHandler.js";

const router = express.Router();

// Get all products with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .populate("category", "name");

    const total = await Product.countDocuments({ isActive: true });

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Create product (admin only)
router.post("/", checkRole(["admin"]), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Update product (admin only)
router.put("/:id", checkRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: name,
        price: price,
        description: description,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Delete product (admin only)
router.delete("/:id", checkRole(["admin"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deactivated successfully" });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

export default router;
