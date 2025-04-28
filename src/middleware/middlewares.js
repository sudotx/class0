import jwt from "jsonwebtoken";
import User from "../models/user.js";

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required - No token provided" });
    }

    const decodedToken = jwt.verify(token, "secret");

    // Get user from database
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication required - User not found" });
    }

    // Add user information to request object
    req.user = {
      id: user._id,
      role: user.role,
      ...user.toObject(),
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};

// check current user
const checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.locals.user = null;
      return next();
    }

    const decodedToken = jwt.verify(token, "secret");
    const user = await User.findById(decodedToken.id);

    if (!user) {
      res.locals.user = null;
      return next();
    }

    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Check user error:", error);
    res.locals.user = null;
    next();
  }
};

const checkPayment = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user has completed payment
    if (!user.hasPaid) {
      return res.status(403).json({
        message: "Payment required",
        paymentUrl: `/api/users/${user._id}/payment`, // We'll implement this route later
      });
    }

    next();
  } catch (error) {
    console.error("Payment check error:", error);
    return res.status(500).json({ message: "Error checking payment status" });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Get user from database using the ID from the JWT token
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - User not found" });
      }

      // Check if user's role is in the allowed roles array
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: "Forbidden - Insufficient permissions",
          requiredRoles: roles,
          userRole: user.role,
        });
      }

      req.user = {
        ...req.user,
        ...user.toObject(),
      };

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during role verification" });
    }
  };
};

export {
  checkPayment,
  checkRole,
  checkUser,
  errorHandler,
  notFound,
  requireAuth,
};
