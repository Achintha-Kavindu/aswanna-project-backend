import Offer from "../models/offer.js";

// Create offer with better error handling
export async function createOffer(req, res) {
  try {
    const user = req.user;

    console.log("Creating offer for user:", user?.firstName, user?.type); // Debug log

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to create an offer",
      });
    }

    if (user.type !== "farmer") {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create an offer. Only farmers can create offers.",
      });
    }

    // Validate required fields
    const { name, image, price, category, location, description, harvestDay } =
      req.body;

    if (
      !name ||
      !image ||
      !price ||
      !category ||
      !location ||
      !description ||
      !harvestDay
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: [
          "name",
          "image",
          "price",
          "category",
          "location",
          "description",
          "harvestDay",
        ],
      });
    }

    const offerData = {
      ...req.body,
      userId: user._id,
      status: "pending",
    };

    console.log("Offer data:", offerData); // Debug log

    const newOffer = new Offer(offerData);
    await newOffer.save();

    res.status(201).json({
      success: true,
      message: "Offer submitted for approval",
      itemId: newOffer.itemId,
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      success: false,
      message: "Offer creation failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

// Continue with all other offer functions with similar improvements...
export async function approveOffer(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve items",
      });
    }

    const { id } = req.params;

    const updatedItem = await Offer.findOneAndUpdate(
      { itemId: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer approved",
      offer: updatedItem,
    });
  } catch (error) {
    console.error("Error approving offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

export async function deleteOffer(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete items",
      });
    }

    const { id } = req.params;

    const deletedItem = await Offer.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer deleted",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

export async function getApprovedOffers(req, res) {
  try {
    const offers = await Offer.find({ status: "approved" });
    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching approved offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

export async function getPendingOffers(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending items",
      });
    }

    const pendingOffers = await Offer.find({ status: "pending" });
    res.status(200).json({
      success: true,
      data: pendingOffers,
    });
  } catch (error) {
    console.error("Error fetching pending offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending offers",
      error: error.message,
    });
  }
}

export async function getOffer(req, res) {
  try {
    const { id } = req.params;

    const offer = await Offer.findOne({ itemId: id });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer found successfully",
      offer: offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching offer",
      error: error.message,
    });
  }
}

export async function updateOffer(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to update an offer",
      });
    }

    const { id } = req.params;

    const existingOffer = await Offer.findOne({ itemId: id });

    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const isOwner = existingOffer.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this offer",
      });
    }

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { itemId: id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message:
        user.type === "farmer"
          ? "Offer updated and submitted for approval"
          : "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message,
    });
  }
}

export async function getAllOffers(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access all offers",
      });
    }

    const filter = req.query.status ? { status: req.query.status } : {};
    const offers = await Offer.find(filter);
    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching all offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

export async function getMyOffers(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to access your offers",
      });
    }

    const myOffers = await Offer.find({ userId: user._id });
    res.status(200).json({
      success: true,
      message: "Your offers retrieved successfully",
      offers: myOffers,
    });
  } catch (error) {
    console.error("Error fetching user offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your offers",
      error: error.message,
    });
  }
}

export async function getApprovedOffersByCategory(req, res) {
  try {
    const { category } = req.params;

    const offers = await Offer.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching offers by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers by category",
      error: error.message,
    });
  }
}

export async function deleteMyOffer(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to delete offers",
      });
    }

    const { id } = req.params;

    const offer = await Offer.findOne({ itemId: id });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Check ownership
    if (
      offer.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own offers",
      });
    }

    const deletedOffer = await Offer.findOneAndDelete({ itemId: id });

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      deletedOffer,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message,
    });
  }
}
