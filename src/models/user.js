const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("deleteOne", { document: true, query: false }, (next) => {
  // Add any cleanup operations here if needed
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
