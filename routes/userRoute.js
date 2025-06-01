import express from "express";
import {
  createUser,
  getSingleUser,
  deleteUser,
  loginUser,
  getAllUsers,
  getCurrentUserProfile,
  updateUserProfile,
  getUserProfile,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getCurrentUserProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.post("/", createUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);

export default userRouter;
