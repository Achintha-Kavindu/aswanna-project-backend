import mongoose from "mongoose";

const galleryItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
});

const GalleryItem = mongoose.model("galleryItems", galleryItemSchema);

export default GalleryItem;
