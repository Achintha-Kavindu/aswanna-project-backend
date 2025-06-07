import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("Auth middleware - Starting authentication check");

    // Check if user is already set by global middleware
    if (req.user) {
      console.log(
        "Auth middleware - User already authenticated:",
        req.user.firstName,
        req.user.type
      );
      return next();
    }

    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth middleware - No valid authorization header");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log("Auth middleware - Token decoded:", decoded);

      // Find the user by id
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("Auth middleware - User not found for ID:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "User not found. Please login again.",
        });
      }

      // Add user to request object
      req.user = user;
      console.log(
        "Auth middleware - User authenticated:",
        user.firstName,
        user.type
      );
      next();
    } catch (jwtError) {
      console.error("Auth middleware - JWT verification error:", jwtError);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
  } catch (error) {
    console.error("Auth middleware - General error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Admin middleware - Checking admin access");

    // Ensure user is authenticated first
    if (!req.user) {
      // Run auth middleware first
      return authMiddleware(req, res, () => {
        if (req.user && req.user.type === "admin") {
          console.log("Admin middleware - Admin access granted");
          next();
        } else {
          console.log("Admin middleware - Admin access denied");
          return res.status(403).json({
            success: false,
            message: "Admin access required",
          });
        }
      });
    }

    // Check if user is admin
    if (req.user.type === "admin") {
      console.log("Admin middleware - Admin access granted");
      next();
    } else {
      console.log("Admin middleware - Admin access denied");
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin middleware - Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in admin authentication",
      error: error.message,
    });
  }
};
