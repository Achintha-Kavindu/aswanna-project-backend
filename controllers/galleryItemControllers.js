import GalleryItem from "../models/galleryItem.js";

// Create gallery item
export async function postGalleryItem(req, res) {
  const user = req.user;

  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to create a gallery item" });
  }

  if (user.type !== "farmer") {
    return res
      .status(403)
      .json({ message: "You are not authorized to create a gallery item" });
  }

  const galleryItemData = {
    ...req.body,
    userId: user._id,
    status: "pending",
  };

  try {
    const newGalleryItem = new GalleryItem(galleryItemData);
    await newGalleryItem.save();

    res.status(200).json({
      message: "Gallery item submitted for approval",
      itemId: newGalleryItem.itemId, // Return the generated ID
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(500).json({
      message: "Gallery Item creation failed",
      error: error.message,
    });
  }
}

// Admin Approval Function
export async function approveGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id }, // Changed to use itemId instead of _id
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({
      message: "Gallery item approved",
      galleryItem: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

// Admin Delete Function
export async function deleteGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }

  const { id } = req.params;

  try {
    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({
      message: "Gallery item deleted",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

// Show only approved items to users
export async function getApprovedGalleryItems(req, res) {
  try {
    const items = await GalleryItem.find({ status: "approved" });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
}

// Get pending items for admin review
export async function getPendingGalleryItems(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can view pending items" });
  }

  try {
    const pendingItems = await GalleryItem.find({ status: "pending" });
    res.status(200).json(pendingItems);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending items",
      error: error.message,
    });
  }
}

// Get gallery item by ID (updated to use itemId)
export async function getGalleryItem(req, res) {
  const { id } = req.params;

  try {
    const galleryItem = await GalleryItem.findOne({ itemId: id });

    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery Item not found" });
    }

    res.status(200).json({
      message: "Gallery Item found successfully",
      galleryItem: galleryItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gallery Item getting error",
      error: error.message,
    });
  }
}

// Update gallery item
export async function updateGalleryItem(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to update a gallery item" });
  }

  const { id } = req.params;

  try {
    const existingItem = await GalleryItem.findOne({ itemId: id });

    if (!existingItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    const isOwner = existingItem.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this gallery item",
      });
    }

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message:
        user.type === "farmer"
          ? "Gallery item updated and submitted for approval"
          : "Gallery item updated successfully",
      galleryItem: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update gallery item",
      error: error.message,
    });
  }
}

// Get all gallery items (admin only)
export async function getAllGalleryItems(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all gallery items",
    });
  }

  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await GalleryItem.find(filter);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch gallery items",
      error: error.message,
    });
  }
}

// Get my gallery items
export async function getMyGalleryItems(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to access your gallery items" });
  }

  try {
    const myItems = await GalleryItem.find({ userId: user._id });
    res.status(200).json({
      message: "Your gallery items retrieved successfully",
      galleryItems: myItems,
    });
  } catch (error) {
    console.error("Error fetching user gallery items:", error);
    res.status(500).json({
      message: "Failed to retrieve your gallery items",
      error: error.message,
    });
  }
}

// Get approved items by category (public)
export async function getApprovedItemsByCategory(req, res) {
  const { category } = req.params;

  try {
    const items = await GalleryItem.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items by category",
      error: error.message,
    });
  }
}

// Farmer can delete their own gallery items
export async function deleteMyGalleryItem(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please login to delete items" });
  }

  const { id } = req.params;

  try {
    const item = await GalleryItem.findOne({ itemId: id });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check ownership
    if (
      item.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own items" });
    }

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}
