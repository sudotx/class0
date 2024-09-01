const express = require("express");
const router = express.Router();
const User = require("../models/user");
const getPaginationData = require("../utils/paginate");

/**
 * Retrieves a user by their unique identifier.
 *
 * @param {string} id - The unique identifier of the user to retrieve.
 * @returns {Promise<User>} - The user object if found, otherwise returns a 404 error.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "user not found",
    });
  }
});

/**
 * Retrieves a paginated list of users.
 *
 * @param {Object} req - The HTTP request object.
 * @param {number} [req.query.page=1] - The page number to retrieve.
 * @param {number} [req.query.limit=10] - The number of users to retrieve per page.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - An object containing the current page, total pages, total users, and the list of users.
 */
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const { currentPage, itemsPerPage, skip, totalPages } = getPaginationData(
      req.query.page,
      req.query.limit,
      totalUsers
    );

    const users = await User.find().skip(skip).limit(itemsPerPage);

    res.json({
      message: "Users retrieved successfully",
      currentPage,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "😱 - Something went wrong",
      error: error.message,
    });
  }
});

/**
 * Creates a new user in the system.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email address of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The saved user object.
 */
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  const user = new User({ name, email, password });
  try {
    const savedUser = await user.save();
    res.json({
      message: savedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "😱 - Something went wrong",
    });
  }
});

/**
 * Updates an existing user in the system.
 *
 * @param {string} id - The unique identifier of the user to update.
 * @param {Object} req.body - The request body containing the updated user data.
 * @param {string} req.body.name - The updated name of the user.
 * @param {string} req.body.email - The updated email address of the user.
 * @param {string} req.body.password - The updated password of the user.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The updated user object.
 */
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
});

module.exports = router;
