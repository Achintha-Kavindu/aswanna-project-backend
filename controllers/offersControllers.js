import Offer from "../models/offer.js";

export async function createOffer(req, res) {
  try {
    console.log("Offer create - Starting creation process");
    const user = req.user;

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

    // Validation - image is optional
    const { name, price, category, location, description, harvestDay } =
      req.body;

    if (
      !name ||
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
          "price",
          "category",
          "location",
          "description",
          "harvestDay",
        ],
      });
    }

    // Create offer data
    const offerData = {
      name,
      price,
      category,
      location,
      description,
      harvestDay,
      condition: req.body.condition || [],
      userId: user._id,
      status: "pending",
      // Image is optional - set default if not provided
      image:
        req.body.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
    };

    console.log("Creating offer with data:", {
      ...offerData,
      image: offerData.image ? "IMAGE_PROVIDED" : "NO_IMAGE",
    });

    // Create and save the offer
    const newOffer = new Offer(offerData);
    await newOffer.save();

    console.log("Offer created successfully with itemId:", newOffer.itemId);

    res.status(201).json({
      success: true,
      message: "Offer submitted for approval",
      itemId: newOffer.itemId,
      offer: newOffer,
    });
  } catch (error) {
    console.error("Offer create - Error:", error);

    // Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.itemId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID conflict. Please try again.",
        error: "Duplicate itemId generated",
      });
    }

    res.status(500).json({
      success: false,
      message: "Offer creation failed",
      error: error.message,
    });
  }
}

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
    console.log("Admin deleting offer with id:", id);

    // SIMPLE FIX: Only search by itemId (numeric)
    const deletedItem = await Offer.findOneAndDelete({ itemId: parseInt(id) });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    console.log("Offer deleted successfully:", deletedItem.itemId);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
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

    // FIXED: Try both itemId and _id for better compatibility
    const offer = await Offer.findOne({
      $or: [{ itemId: id }, { _id: id }],
    });

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
    console.log("Updating offer with id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let existingOffer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      existingOffer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!existingOffer && id.match(/^[0-9a-fA-F]{24}$/)) {
      existingOffer = await Offer.findOne({ _id: id });
    }

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

    // Update using the same query logic
    let updatedOffer;
    if (!isNaN(id)) {
      updatedOffer = await Offer.findOneAndUpdate(
        { itemId: parseInt(id) },
        updateData,
        { new: true }
      );
    } else {
      updatedOffer = await Offer.findOneAndUpdate({ _id: id }, updateData, {
        new: true,
      });
    }

    console.log("Offer updated successfully:", updatedOffer.itemId);

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
    console.log("Farmer deleting own offer with id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let offer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      offer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!offer && id.match(/^[0-9a-fA-F]{24}$/)) {
      offer = await Offer.findOne({ _id: id });
    }

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

    // Delete the offer using the same logic
    let deletedOffer;
    if (!isNaN(id)) {
      deletedOffer = await Offer.findOneAndDelete({ itemId: parseInt(id) });
    } else {
      deletedOffer = await Offer.findOneAndDelete({ _id: id });
    }

    console.log("Offer deleted successfully:", deletedOffer.itemId);

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

// Add this function to your existing offersControllers.js

export async function getOfferById(req, res) {
  try {
    const { id } = req.params;
    console.log("Getting offer by id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let offer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      offer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!offer && id.match(/^[0-9a-fA-F]{24}$/)) {
      offer = await Offer.findOne({ _id: id });
    }

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
