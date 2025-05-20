import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    // Check if auth header exists and has the right format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      // Verify the token (you'll need to set JWT_SECRET in your environment variables)
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      // Find the user by id
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Optional: middleware specifically for checking admin access
export const adminMiddleware = async (req, res, next) => {
  try {
    // Call the auth middleware first to set the user
    authMiddleware(req, res, () => {
      // Check if user is admin
      if (req.user && req.user.type === "admin") {
        next();
      } else {
        return res.status(403).json({ message: "Admin access required" });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
