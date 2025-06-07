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
import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);

// Protected routes
userRouter.get("/", authMiddleware, getAllUsers);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);

// Admin approval routes - FIXED: Correct route order and parameters
userRouter.get("/admin/pending", authMiddleware, getPendingUsers);
userRouter.put("/admin/approve/:userId", authMiddleware, approveUser);
userRouter.put("/approve/:id", authMiddleware, adminMiddleware, approveUser); // FIXED: This matches frontend call

export default userRouter;
