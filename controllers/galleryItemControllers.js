import GalleryItem from "../models/galleryItem.js";

export async function postGalleryItem(req, res) {
  try {
    console.log("Gallery create - Starting creation process");
    console.log("Gallery create - Request user:", req.user);
    console.log("Gallery create - Request body:", req.body);

    const user = req.user;

    if (!user) {
      console.log("Gallery create - No user found");
      return res.status(403).json({
        success: false,
        message: "Please login to create a gallery item",
      });
    }

    console.log("Gallery create - User found:", user.firstName, user.type);

    if (user.type !== "farmer") {
      console.log("Gallery create - User is not a farmer:", user.type);
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create a gallery item. Only farmers can create gallery items.",
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
      console.log("Gallery create - Missing required fields");
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
        received: {
          name,
          image: !!image,
          price,
          category,
          location,
          description,
          harvestDay,
        },
      });
    }

    const galleryItemData = {
      ...req.body,
      userId: user._id,
      status: "pending",
    };

    console.log("Gallery create - Creating item with data:", {
      ...galleryItemData,
      image: "IMAGE_DATA_PRESENT",
    });

    const newGalleryItem = new GalleryItem(galleryItemData);
    await newGalleryItem.save();

    console.log(
      "Gallery create - Item created successfully:",
      newGalleryItem.itemId
    );

    res.status(201).json({
      success: true,
      message: "Gallery item submitted for approval",
      itemId: newGalleryItem.itemId,
      galleryItem: {
        ...newGalleryItem.toObject(),
        image: "IMAGE_DATA_PRESENT", // Don't send full image data in response
      },
    });
  } catch (error) {
    console.error("Gallery create - Error:", error);
    res.status(500).json({
      success: false,
      message: "Gallery Item creation failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

// Keep all other existing functions unchanged...
export async function approveGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve items",
      });
    }

    const { id } = req.params;

    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item approved",
      galleryItem: updatedItem,
    });
  } catch (error) {
    console.error("Error approving gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

// Continue with all other existing functions...
export async function deleteGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete items",
      });
    }

    const { id } = req.params;

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item deleted",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

export async function getApprovedGalleryItems(req, res) {
  try {
    const items = await GalleryItem.find({ status: "approved" });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching approved gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message,
    });
  }
}

export async function getPendingGalleryItems(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending items",
      });
    }

    const pendingItems = await GalleryItem.find({ status: "pending" });
    res.status(200).json({
      success: true,
      data: pendingItems,
    });
  } catch (error) {
    console.error("Error fetching pending gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending items",
      error: error.message,
    });
  }
}

export async function getGalleryItem(req, res) {
  try {
    const { id } = req.params;

    const galleryItem = await GalleryItem.findOne({ itemId: id });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery Item found successfully",
      galleryItem: galleryItem,
    });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Gallery Item getting error",
      error: error.message,
    });
  }
}

export async function updateGalleryItem(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to update a gallery item",
      });
    }

    const { id } = req.params;

    const existingItem = await GalleryItem.findOne({ itemId: id });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const isOwner = existingItem.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
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
      success: true,
      message:
        user.type === "farmer"
          ? "Gallery item updated and submitted for approval"
          : "Gallery item updated successfully",
      galleryItem: updatedItem,
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update gallery item",
      error: error.message,
    });
  }
}

export async function getAllGalleryItems(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access all gallery items",
      });
    }

    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await GalleryItem.find(filter);
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching all gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery items",
      error: error.message,
    });
  }
}

export async function getMyGalleryItems(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to access your gallery items",
      });
    }

    const myItems = await GalleryItem.find({ userId: user._id });
    res.status(200).json({
      success: true,
      message: "Your gallery items retrieved successfully",
      galleryItems: myItems,
    });
  } catch (error) {
    console.error("Error fetching user gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your gallery items",
      error: error.message,
    });
  }
}

export async function getApprovedItemsByCategory(req, res) {
  try {
    const { category } = req.params;

    const items = await GalleryItem.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items by category",
      error: error.message,
    });
  }
}

export async function deleteMyGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to delete items",
      });
    }

    const { id } = req.params;

    const item = await GalleryItem.findOne({ itemId: id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check ownership
    if (
      item.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own items",
      });
    }

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}
