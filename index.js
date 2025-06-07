import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoute.js";
import offerRouter from "./routes/offerRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";
import jwt from "jsonwebtoken";
import User from "./models/user.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const connectionString = process.env.MONGODB_URL;

// Global middleware for token parsing (improved)
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log("Global middleware - Decoded token:", decoded);

      // Find the actual user from database
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
        console.log(
          "Global middleware - User found:",
          user.firstName,
          user.type
        );
      } else {
        console.log("Global middleware - User not found in database");
      }
    } catch (error) {
      console.log(
        "Global middleware - Token verification failed:",
        error.message
      );
    }
  }

  next();
});

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });

app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/offers", offerRouter);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
