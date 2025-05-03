import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const connectionString = process.env.MONGODB_URL;
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("data base connected");
  })
  .catch(() => {
    console.log("data base error");
  });

app.listen(5000, (req, res) => {
  console.log("server is runing on port 5000");
});
