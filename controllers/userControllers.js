// controllers/userControllers.js
import { response } from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Create user function (auto-pending for non-admins)
export async function createUser(req, res) {
  const user = req.body;

  const password = req.body.password;
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(password, saltRounds);

  user.password = passwordHash;

  // Set approval status based on user type
  if (user.type === "admin") {
    user.approvalStatus = "approved"; // Admins are auto-approved
  } else {
    user.approvalStatus = "pending"; // Farmers and buyers need approval
  }

  const newUser = new User(user);

  try {
    await newUser.save();
    console.log("User created successfully");

    if (user.type === "admin") {
      res.status(200).json({
        message: "Admin user created and approved successfully",
      });
    } else {
      res.status(200).json({
        message: "User created successfully. Awaiting admin approval.",
      });
    }
  } catch (error) {
    console.log("User creation failed");
    res.status(400).json({
      message: "User creation failed",
      error: error,
    });
  }
}

// Updated login function with approval check
export async function loginUser(req, res) {
  const credentials = req.body;

  try {
    const user = await User.findOne({
      email: credentials.email,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(credentials.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check approval status
    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        message:
          "Your account is pending admin approval. Please wait for approval.",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your account has been rejected. Please contact admin.",
      });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });
    return res.status(200).json({
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    res.status(400).json({
      message: "Login error",
      error: error,
    });
  }
}

// FIXED: Approve user function with correct parameter handling
export async function approveUser(req, res) {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.type !== "admin") {
      return res.status(403).json({
        message: "Only admins can approve users",
      });
    }

    // FIXED: Get id from params (matching the route)
    const { id, userId } = req.params;
    const targetUserId = id || userId; // Handle both parameter names

    console.log("Approving user:", targetUserId);

    // FIXED: Simple approval without requiring action in body
    const updateData = {
      approvalStatus: "approved",
      emailVerified: true, // Also set emailVerified for compatibility
      approvedBy: adminUser.id,
      approvedAt: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(targetUserId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User approved successfully:", updatedUser.email);

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve user",
      error: error.message,
    });
  }
}

// Get pending users (admin only)
export async function getPendingUsers(req, res) {
  const adminUser = req.user;

  if (!adminUser || adminUser.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can view pending users",
    });
  }

  try {
    const pendingUsers = await User.find({
      approvalStatus: "pending",
    }).select("-password");

    res.status(200).json({
      message: "Pending users retrieved successfully",
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pending users",
      error: error.message,
    });
  }
}

// Updated getAllUsers function
export async function getAllUsers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all users",
    });
  }

  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true, // FIXED: Add success field for consistency
      message: "All users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
}

// Other existing functions remain the same...
export async function getSingleUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
      error: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(400).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
}
