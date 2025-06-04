import Offer from "../models/offer.js";

// Create offer
export async function createOffer(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please login to create an offer" });
  }

  if (user.type !== "farmer") {
    return res
      .status(403)
      .json({ message: "You are not authorized to create an offer" });
  }

  const offerData = {
    ...req.body,
    userId: user._id,
    status: "pending",
  };

  try {
    const newOffer = new Offer(offerData);
    await newOffer.save();

    res.status(200).json({
      message: "Offer submitted for approval",
      itemId: newOffer.itemId,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      message: "Offer creation failed",
      error: error.message,
    });
  }
}

// Admin Approval Function
export async function approveOffer(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    const updatedItem = await Offer.findOneAndUpdate(
      { itemId: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer approved",
      offer: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

export async function deleteOffer(req, res) {
  const user = req.user;
  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }
  const { id } = req.params;
  const numericId = Number(id);

  try {
    const deletedItem = await Offer.findOneAndDelete({ itemId: numericId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json({
      message: "Offer deleted",
      deletedItem,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

// Show only approved offers to users
export async function getApprovedOffers(req, res) {
  try {
    const offers = await Offer.find({ status: "approved" });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

// Get pending offers for admin review
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
    res.status(500).json({
      message: "Failed to fetch pending offers",
      error: error.message,
    });
  }
}

// Get offer by ID (using itemId)
export async function getOffer(req, res) {
  const { id } = req.params;

  try {
    const offer = await Offer.findOne({ itemId: id });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer found successfully",
      offer: offer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching offer",
      error: error.message,
    });
  }
}

// controllers/offersControllers.js - Update function
export async function updateOffer(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(403).json({ message: "Please login to update an offer" });
  }

  const { id } = req.params;

  try {
    const existingOffer = await Offer.findOne({ itemId: id });

    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const isOwner = existingOffer.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this offer",
      });
    }

    // Store old data for comparison
    const oldData = {
      name: existingOffer.name,
      price: existingOffer.price,
      category: existingOffer.category,
      location: existingOffer.location,
      description: existingOffer.description,
      harvestDay: existingOffer.harvestDay,
      condition: existingOffer.condition,
      image: existingOffer.image,
    };

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
      updateData.previousData = oldData;
      updateData.lastUpdated = new Date();
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { itemId: id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message:
        user.type === "farmer"
          ? "Offer updated and submitted for admin approval"
          : "Offer updated successfully",
      offer: updatedOffer,
      changes:
        user.type === "farmer"
          ? {
              old: oldData,
              new: req.body,
            }
          : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update offer",
      error: error.message,
    });
  }
}

// Get all offers (admin only)
export async function getAllOffers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all offers",
    });
  }

  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const offers = await Offer.find(filter);
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

// Get my offers
export async function getMyOffers(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to access your offers" });
  }

  try {
    const myOffers = await Offer.find({ userId: user._id });
    res.status(200).json({
      message: "Your offers retrieved successfully",
      offers: myOffers,
    });
  } catch (error) {
    console.error("Error fetching user offers:", error);
    res.status(500).json({
      message: "Failed to retrieve your offers",
      error: error.message,
    });
  }
}

// Get approved offers by category (public)
export async function getApprovedOffersByCategory(req, res) {
  const { category } = req.params;

  try {
    const offers = await Offer.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers by category",
      error: error.message,
    });
  }
}

export async function deleteMyOffer(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please log in." });
  }

  const { itemId } = req.params;

  try {
    const offer = await Offer.findOne({ itemId: itemId });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    console.log("Offer User ID:", offer.userId.toString());
    console.log("Request User ID:", user._id.toString());

    if (offer.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this offer.",
      });
    }

    const deletedOffer = await Offer.findOneAndDelete({ itemId: itemId });

    res.status(200).json({
      message: "Offer successfully deleted.",
      deletedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete offer.",
      error: error.message,
    });
  }
}
