const express = require("express");

const router = express.Router();
const User = require("../models/user");
const getPaginationData = require("../utils/paginate");

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: user });
  } catch (error) {
    return res.status(500).json({ message: "User not found" });
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
    return res.status(500).json({
      message: "😱 - Something went wrong",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  const user = new User({ name, email, password });
  try {
    const savedUser = await user.save();
    return res.json({ message: savedUser });
  } catch (error) {
    return res.status(500).json({ message: "😱 - Something went wrong" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "😱 - Something went wrong",
      error: error.message,
    });
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
    return res.status(500).json({
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
});

module.exports = router;
