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

// Parameterized routes
router.get("/:id", getOffer);

// Update
router.put("/approve/:id", authMiddleware, adminMiddleware, approveOffer);
router.put("/update/:id", authMiddleware, updateOffer);

// Delete
router.delete("/my-offers/:itemId", authMiddleware, deleteMyOffer);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteOffer);

export default router;
