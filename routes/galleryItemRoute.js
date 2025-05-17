// galleryItemRoute.js
import express from "express";
import {
  postGalleryItem,
  getGalleryItem,
  approveGalleryItem,
  deleteGalleryItem,
  getPendingGalleryItems,
  getApprovedGalleryItems,
} from "../controllers/galleryItemControllers.js";

const galleryItemRouter = express.Router();

galleryItemRouter.post("/", postGalleryItem);
galleryItemRouter.get("/", getGalleryItem);
galleryItemRouter.get("/approved", getApprovedGalleryItems); // Get approved items
galleryItemRouter.get("/pending", getPendingGalleryItems); // Admin view pending
galleryItemRouter.patch("/approve/:id", approveGalleryItem); // Admin approve
galleryItemRouter.delete("/:id", deleteGalleryItem); // Admin delete

export default galleryItemRouter;
