// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user is approved
      if (user.approvalStatus !== "approved") {
        return res.status(403).json({
          message: "Your account is not approved. Please contact admin.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// middleware/authMiddleware.js
export const adminMiddleware = (req, res, next) => {
  if (req.user?.type === "admin") return next();
  return res.status(403).json({
    message: "Admin access required",
  });
};
