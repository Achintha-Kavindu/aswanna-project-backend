import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";
import jwt, { decode } from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectionString = process.env.MONGODB_URL;

app.use((req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); //token thiyenawada balanawa

  if (token != null) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("data base connected");
  })
  .catch(() => {
    console.log("data base error");
  });

app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);

app.listen(5000, (req, res) => {
  console.log("server is runing on port 5000");
});
