import express from "express";
import {
  postGalleryItem,
  approveGalleryItem,
  deleteGalleryItem,
  getApprovedGalleryItems,
  getPendingGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  getAllGalleryItems,
  getMyGalleryItems,
  getApprovedItemsByCategory,
} from "../controllers/galleryItemControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/create", authMiddleware, postGalleryItem);

// Read - specific routes first
router.get("/category/:category", getApprovedItemsByCategory);
router.get("/my-items", authMiddleware, getMyGalleryItems);
router.get("/approved", getApprovedGalleryItems);
router.get("/pending", authMiddleware, getPendingGalleryItems);
router.get("/admin/items", authMiddleware, getAllGalleryItems);

// Read - parameterized routes after
router.get("/:id", getGalleryItem);

// Update
router.put("/approve/:id", authMiddleware, approveGalleryItem);
router.put("/update/:id", authMiddleware, updateGalleryItem);

// Delete
router.delete("/delete/:id", authMiddleware, deleteGalleryItem);

export default router;
