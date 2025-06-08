// routes/offerRoute.js
import express from "express";
import {
  createOffer,
  approveOffer,
  deleteOffer,
  getApprovedOffers,
  getPendingOffers,
  getOffer,
  getMyOffers,
  updateOffer,
  getAllOffers,
  getApprovedOffersByCategory,
  deleteMyOffer,
  getOfferById,
} from "../controllers/offersControllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/", authMiddleware, createOffer);

// Read
router.get("/approved", getApprovedOffers);
router.get("/my-offers", authMiddleware, getMyOffers);
router.get("/pending", authMiddleware, adminMiddleware, getPendingOffers);
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOffers);
router.get("/category/:category", getApprovedOffersByCategory);

// Update
router.put("/approve/:id", authMiddleware, adminMiddleware, approveOffer);
router.put("/update/:id", authMiddleware, updateOffer);

// Delete routes - FIXED: Updated parameter names to match controllers
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteOffer); // Admin delete
router.delete("/my-offers/:id", authMiddleware, deleteMyOffer); // Farmer delete
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteOffer); // Alternative admin delete
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer); // Direct delete for admin panel

// Parameterized routes (keep at end to avoid conflicts)
router.get("/:id", getOffer);
router.get("/:id", getOfferById);

export default router;
