// controllers/offerControllers.js
import Offer from "../models/offer.js";

export async function createOffer(req, res) {
  const user = req.user;

  if (!user) {
    res.status(403).json({ message: "please login to create an offer" });
    return;
  }

  if (user.type !== "farmer") {
    res
      .status(403)
      .json({ message: "you are not authorized to create an offer" });
    return;
  }

  const offerData = {
    ...req.body,
    status: "pending", // always pending until admin approves
  };

  const newOffer = new Offer(offerData);

  try {
    await newOffer.save();
    res.status(200).json({ message: "Offer submitted for approval" });
  } catch (error) {
    res.status(500).json({ message: "Offer creation failed", error: error });
  }
}

export async function approveOffer(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    await Offer.findByIdAndUpdate(id, { status: "approved" });
    res.status(200).json({ message: "Offer approved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve item", error });
  }
}

export async function deleteOffer(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }

  const { id } = req.params;

  try {
    await Offer.findByIdAndDelete(id);
    res.status(200).json({ message: "Offer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error });
  }
}

export async function getApprovedOffers(req, res) {
  try {
    const offers = await Offer.find({ status: "approved" });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offers", error });
  }
}

export async function getPendingOffers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can view pending items" });
  }

  try {
    const pendingOffers = await Offer.find({ status: "pending" });
    res.status(200).json(pendingOffers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending offers", error });
  }
}

export async function getOffer(req, res) {
  const offerName = req.body.name;
  try {
    const offer = await Offer.findOne({ name: offerName });
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json({ message: "Offer found successfully", offer: offer });
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer", error: error });
  }
}
