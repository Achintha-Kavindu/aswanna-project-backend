import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectionString = process.env.MONGODB_URL;
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
