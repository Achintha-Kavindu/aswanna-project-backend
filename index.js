import express from "express";

const app = express();

app.listen(5000, (req, res) => {
  console.log("server is runing on port 5000");
});
