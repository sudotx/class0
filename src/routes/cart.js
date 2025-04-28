import express from "express";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import handleErrors from "../utils/errorHandler.js";

const router = express.Router();

// Get user's cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name price images"
    );
    if (!cart) {
      return res.json({ items: [], total: 0 });
    }
    res.json(cart);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Add item to cart
router.post("/items", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        total: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Update cart item quantity
router.put("/items/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Remove item from cart
router.delete("/items/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();
    res.json(cart);
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

export default router;
