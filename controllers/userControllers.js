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

// get all useres

export async function getSingleUser(req, res) {
  const userEmail = req.body.email;

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ massage: "user not found" });
    }

    res.status(200).json({ message: "user found successfully", user: user });
  } catch (error) {
    console.log("user getting error");
    res.status(400).json({ massage: "user getting error", error: error });
  }
}

// delete user

export async function deleteUser(req, res) {
  const user = req.user;

  // Check if the user is an admin
  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete users" });
  }

  const userEmail = req.body.email;

  try {
    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.log("Error deleting user");
    res.status(400).json({
      message: "Error deleting user",
      error: error,
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
