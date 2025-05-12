import express from "express";
import {
  createUser,
  getSingleUser,
  deleteUser,
  loginUser,
} from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getSingleUser);
userRouter.delete("/", deleteUser);
userRouter.post("/login", loginUser);

export default userRouter;
