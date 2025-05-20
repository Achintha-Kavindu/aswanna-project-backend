import mongoose from "mongoose";

const galleryItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  harvestDay: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }, // Added creation date
  itemId: { type: Number, unique: true }, // Added custom numeric ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Changed to singular "User" (common convention)
    required: true,
  },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
});

// Pre-save hook to generate custom numeric ID
galleryItemSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const count = await this.constructor.countDocuments();
    this.itemId = 1400 + count + 1;
    next();
  } catch (error) {
    next(error);
  }
});

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
