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

// Public routes
router.get("/approved", getApprovedOffers);
router.get("/category/:category", getApprovedOffersByCategory);
router.get("/pending", authMiddleware, adminMiddleware, getPendingOffers);

// Protected routes requiring authentication
router.post("/", authMiddleware, createOffer);
router.get("/my-offers", authMiddleware, getMyOffers);
router.put("/update/:id", authMiddleware, updateOffer);

router.get("/:id", getOffer); // Changed from /single to use itemId

// Admin-only routes
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOffers);
router.put("/approve/:id", authMiddleware, adminMiddleware, approveOffer);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer);
router.delete("/my-offers/:id", authMiddleware, deleteMyOffer);

export default router;
