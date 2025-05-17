// routes/offerRoute.js
import express from "express";
import {
  createOffer,
  approveOffer,
  deleteOffer,
  getApprovedOffers,
  getPendingOffers,
  getOffer,
} from "../controllers/offersControllers.js";

const router = express.Router();

router.post("/", createOffer);
router.get("/approved", getApprovedOffers);
router.get("/pending", getPendingOffers);
router.get("/single", getOffer);
router.patch("/approve/:id", approveOffer);
router.delete("/:id", deleteOffer);

export default router;
