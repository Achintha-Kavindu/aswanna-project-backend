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
    userId: user._id, // Set userId from authenticated user
    status: "pending", // always pending until admin approves
  };

  // For debugging purpose
  console.log("Creating offer with data:", offerData);
  console.log("User ID being set:", user._id);

  const newOffer = new Offer(offerData);
  try {
    await newOffer.save();
    res.status(200).json({ message: "Offer submitted for approval" });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      message: "Offer creation failed",
      error: error.message,
    });
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
    res
      .status(500)
      .json({ message: "Failed to approve item", error: error.message });
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
    res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
}

export async function getApprovedOffers(req, res) {
  try {
    const offers = await Offer.find({ status: "approved" });
    res.status(200).json(offers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch offers", error: error.message });
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
    res
      .status(500)
      .json({
        message: "Failed to fetch pending offers",
        error: error.message,
      });
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
    res
      .status(500)
      .json({ message: "Error fetching offer", error: error.message });
  }
}

export async function updateOffer(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(403).json({ message: "Please login to update an offer" });
  }

  const { id } = req.params;

  try {
    // First get the existing offer
    const existingOffer = await Offer.findById(id);

    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Only allow the farmer who created the offer or an admin to update
    const isOwner =
      existingOffer.userId &&
      existingOffer.userId.toString() === user._id.toString();
    if (user.type !== "admin" && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this offer" });
    }

    // Prepare update data
    let updateData = { ...req.body };

    // If a farmer is updating, set status back to pending for admin review
    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    // Update the offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message:
        user.type === "farmer"
          ? "Offer updated and submitted for approval"
          : "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update offer", error: error.message });
  }
}

export async function getAllOffers(req, res) {
  try {
    // Get all offers - can be filtered by query parameters
    const filter = {};

    // Apply filters if provided in query string
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Can add more filters as needed
    const offers = await Offer.find(filter);
    res.status(200).json(offers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch offers", error: error.message });
  }
}

export async function getMyOffers(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to access your offers" });
  }

  // For debugging
  console.log("Getting offers for user ID:", user._id);
  console.log("User object:", user);

  try {
    // Find all offers created by this user
    const myOffers = await Offer.find({ userId: user._id });

    // More debugging
    console.log("Found offers:", myOffers.length);
    console.log("First offer (if any):", myOffers[0]);

    // Check if there are any offers at all
    const totalOffers = await Offer.countDocuments();
    console.log("Total offers in database:", totalOffers);

    // Check a few offers to see if they have userId
    if (totalOffers > 0) {
      const someOffers = await Offer.find().limit(3);
      console.log("Sample offers:", someOffers);
    }

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
