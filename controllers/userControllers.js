import { response } from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// create user function
export async function createUser(req, res) {
  const user = req.body;

  const password = req.body.password;

  const saltRounds = 10;

  const passwordHash = bcrypt.hashSync(password, saltRounds);

  user.password = passwordHash;

  const newUser = new User(user);

  try {
    await newUser.save();
    console.log("user created successfully");
    res.status(200).json({ massage: "user created successfully" });
  } catch (error) {
    console.log("user created failed");
    res.status(400).json({ massage: "user creation failed", error: error });
  }
}

// Get single user by ID
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

// Delete user (Admin only)
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

// login user
export async function loginUser(req, res) {
  const credentials = req.body;

  try {
    const user = await User.findOne({
      email: credentials.email,
    });

    if (!user) {
      return res.status(404).json({ massage: "user not found" });
    }

    const isMatch = bcrypt.compareSync(credentials.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });
    return res
      .status(200)
      .json({ massage: "user  found", user: user, token: token });
  } catch (error) {
    res.status(400).json({ massage: "user getting error", error: error });
  }
}

// Get all users (admin only)

export async function getAllUsers(req, res) {
  const user = req.user;

  // Check if user exists and is an admin
  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all users",
    });
  }

  try {
    // Get all users from the database
    const users = await User.find({}).select("-password -img"); // Exclude passwords from the results for security

    // Return the list of users
    res.status(200).json({
      message: "All users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
}

// Get current user profile data
export async function getCurrentUserProfile(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "User not authenticated",
    });
  }

  try {
    // Get user data from the database
    const userData = await User.findById(user.id).select("-password -img");

    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return user profile data
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: {
        name: userData.firstName || userData.username,
        location: userData.location || userData.address,
        phone: userData.phone || userData.phoneNumber,
        email: userData.email,
        username: userData.username,
        type: userData.type,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user profile",
      error: error.message,
    });
  }
}

// Update user profile data
export async function updateUserProfile(req, res) {
  const user = req.user;
  const { name, location, phone, email } = req.body;

  if (!user) {
    return res.status(401).json({
      message: "User not authenticated",
    });
  }

  try {
    // Update user data in the database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        name: name || user.name,
        location: location || user.location,
        phone: phone || user.phone,
        email: email || user.email,
      },
      { new: true, runValidators: true }
    ).select("-password -img");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return updated user profile data
    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        name: updatedUser.name || updatedUser.username,
        location: updatedUser.location || updatedUser.address,
        phone: updatedUser.phone || updatedUser.phoneNumber,
        email: updatedUser.email,
        username: updatedUser.username,
        type: updatedUser.type,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user profile",
      error: error.message,
    });
  }
}

// controllers/userControllers.js එකට add කරන්න
export async function getUserProfile(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Return user data without sensitive information
    const userProfile = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      phone: user.phone,
      type: user.type,
      img: user.img,
    };

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
}
