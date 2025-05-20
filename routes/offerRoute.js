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
} from "../controllers/offersControllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedOffers);
router.get("/single", getOffer);
router.get("/all", getAllOffers);

// Protected routes requiring authentication
router.post("/", authMiddleware, createOffer);
router.get("/my-offers", authMiddleware, getMyOffers);
router.put("/update/:id", authMiddleware, updateOffer);

// Admin-only routes
router.get("/pending", adminMiddleware, getPendingOffers);
router.patch("/approve/:id", adminMiddleware, approveOffer);
router.delete("/:id", adminMiddleware, deleteOffer);

export default router;
