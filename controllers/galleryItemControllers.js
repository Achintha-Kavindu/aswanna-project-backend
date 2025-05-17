// galleryItemControllers.js
import GalleryItem from "../models/galleryItem.js";

//create gallery item
export function postGalleryItem(req, res) {
  const user = req.user;

  if (!user) {
    res.status(403).json({ message: "please login to create a gallery item" });
    return;
  }

  if (user.type !== "farmer") {
    res
      .status(403)
      .json({ message: "you are not authorized to create a gallery item" });
    return;
  }

  const galleryItemData = {
    ...req.body,
    status: "pending", // always pending until admin approves
  };

  const newGalleryItem = new GalleryItem(galleryItemData);

  try {
    newGalleryItem.save();
    res.status(200).json({ message: "Gallery item submitted for approval" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gallery Item creation failed", error: error });
  }
}

//Admin Approval Function
export async function approveGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    await GalleryItem.findByIdAndUpdate(id, { status: "approved" });
    res.status(200).json({ message: "Gallery item approved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve item", error });
  }
}

//Admin Delete Function
export async function deleteGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }

  const { id } = req.params;

  try {
    await GalleryItem.findByIdAndDelete(id);
    res.status(200).json({ message: "Gallery item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error });
  }
}

//Show only approved items to users
export async function getApprovedGalleryItems(req, res) {
  try {
    const items = await GalleryItem.find({ status: "approved" });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error });
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
    res.status(500).json({ message: "Failed to fetch pending items", error });
  }
}

//get gallery item by name
export async function getGalleryItem(req, res) {
  const galleryItemName = req.body.name;

  try {
    const galleryName = await GalleryItem.findOne({ name: galleryItemName });

    if (!galleryName) {
      return res.status(404).json({ message: "Gallery Item not found" });
    }

    res.status(200).json({
      message: "Gallery Item found successfully",
      galleryName: galleryName,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gallery Item getting error", error: error });
  }
}
