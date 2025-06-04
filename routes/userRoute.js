// routes/userRoute.js
import express from "express";
import {
  createUser,
  getSingleUser,
  deleteUser,
  loginUser,
  getAllUsers,
  approveUser,
  getPendingUsers,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);
userRouter.post("/login", loginUser);
userRouter.get("/", authMiddleware, getAllUsers);

// New approval routes
userRouter.get("/admin/pending", authMiddleware, getPendingUsers);
userRouter.put("/admin/approve/:userId", authMiddleware, approveUser);

export default userRouter;
