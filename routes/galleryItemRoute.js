import express from "express";
import {
  postGalleryItem,
  getGalleryItem,
} from "../controllers/galleryItemControllers.js";

const galleryItemRouter = express.Router();

galleryItemRouter.post("/", postGalleryItem);
galleryItemRouter.get("/", getGalleryItem);

export default galleryItemRouter;
