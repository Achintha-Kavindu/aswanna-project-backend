// routes/galleryItemRoute.js - Route order is critical
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
  deleteMyGalleryItem,
} from "../controllers/galleryItemControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/create", authMiddleware, postGalleryItem);

// Read - SPECIFIC routes FIRST (very important)
router.get("/approved", getApprovedGalleryItems);
router.get("/my-items", authMiddleware, getMyGalleryItems);
router.get("/pending", authMiddleware, getPendingGalleryItems);
router.get("/admin/items", authMiddleware, getAllGalleryItems); // Admin route
router.get("/category/:category", getApprovedItemsByCategory);

// Read - parameterized routes LAST
router.get("/:id", getGalleryItem);

// Update
router.put("/approve/:id", authMiddleware, approveGalleryItem);
router.put("/update/:id", authMiddleware, updateGalleryItem);

// Delete
router.delete("/delete/:id", authMiddleware, deleteGalleryItem);
router.delete("/my-items/:id", authMiddleware, deleteMyGalleryItem);

export default router;
