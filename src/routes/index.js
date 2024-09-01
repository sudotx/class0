const express = require("express");
const router = express.Router();
const User = require("../models/user");

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
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const user = User.findByIdAndUpdate(id, { name, email, password });

  try {
    user.save();
    res.json({
      message: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "😱 - Something went wrong",
    });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const user = User.findByIdAndDelete(id);
  res.status(204).json({
    message: user,
  });
});

module.exports = router;
