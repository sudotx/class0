import jwt from "jsonwebtoken";
import User from "../models/user.js";

// 1. Basic Middleware Example - Logging
// Demonstrates how middleware can intercept and log requests
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Always call next() to pass control to the next middleware
};

// 2. Error Handling Middleware
// Shows how to handle errors in a centralized way
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
};

// 3. Authentication Middleware
// Demonstrates basic JWT token verification
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 4. Role-Based Access Control
// Shows how to implement role-based permissions
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in first" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

// 5. Request Validation Middleware
// Demonstrates how to validate request data
const validateUserData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  next();
};

// 6. Response Time Middleware
// Shows how to measure and log response times
const responseTime = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Request to ${req.url} took ${duration}ms`);
  });

  next();
};

export {
  requestLogger,
  errorHandler,
  requireAuth,
  checkRole,
  validateUserData,
  responseTime,
};
