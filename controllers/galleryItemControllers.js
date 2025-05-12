import GalleryItem from "../models/galleryItem.js";

//create gallery item
export function postGalleryItem(req, res) {
  const galleryItem = req.body;

  const newGalleryItem = new GalleryItem(galleryItem);

  try {
    newGalleryItem.save();
    res.status(200).json({ massage: "Gallery Item created successfully" });
  } catch (error) {
    es.status(500).json({ massage: "user creation failed", error: error });
  }
}

//get gallery item

export async function getGalleryItem(req, res) {
  const galleryItemName = req.body.name;

  try {
    const galleryName = await GalleryItem.findOne({ name: galleryItemName });

    if (!galleryName) {
      return res.status(404).json({ massage: "Gallery Item not found" });
    }

    res
      .status(200)
      .json({
        message: "Gallery Item found successfully",
        galleryName: galleryName,
      });
  } catch (error) {
    res
      .status(400)
      .json({ massage: "Gallery Item getting error", error: error });
  }
}
