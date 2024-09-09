const express = require("express");

const router = express.Router();
const getPaginationData = require("../utils/paginate");

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/middlewares");

router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: user });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

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
      message: "Users retrieved successfully",
      currentPage,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  const user = new User({ name, email, password });
  try {
    const savedUser = await user.save();
    return res.json({ message: savedUser });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      name,
      email,
      password,
    });

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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

router.get("/logout", () => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

module.exports = router;
