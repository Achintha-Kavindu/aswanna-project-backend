import { response } from "express";
import User from "../models/user.js";

// create user function
export async function createUser(req, res) {
  const user = req.body;
  const newUser = new User(user);

  try {
    await newUser.save();
    console.log("user created successfully");
    res.status(200).json({ massage: "user created successfully" });
  } catch (error) {
    console.log("user created failed");
    res.status(400).json({ massage: "user created failed", error: error });
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
  const userEmail = req.body.email;

  try {
    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (!deletedUser) {
      return res.status(404).json({ massage: "user not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.log("Error deleting user");
    res.status(400).json({ massage: "Error deleting user", error: error });
  }
}

//login
export async function loginUser(req, res) {
  const credentials = req.body;

  try {
    const user = await User.findOne({
      email: credentials.email,
      password: credentials.password,
    });

    if (!user) {
      return res.status(404).json({ massage: "user not found" });
    } else {
      return res.status(200).json({ massage: "user  found", user: user });
    }
  } catch (error) {
    res.status(400).json({ massage: "user getting error", error: error });
  }
}
