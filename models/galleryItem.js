// models/galleryItem.js - Add previousData field
import e from "express";
import mongoose from "mongoose";

const galleryItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: false },
  price: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  harvestDay: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date },
  itemId: { type: Number, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owner: {
    name: { type: String },
    location: { type: String },
    phone: { type: String },
    email: { type: String },
  },

  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  // Add previous data tracking
  previousData: { type: Object },
  updateHistory: [
    {
      updatedAt: { type: Date, default: Date.now },
      changes: { type: Object },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

// Current problematic pre-save hook
galleryItemSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    // FIXED: Better itemId generation
    const lastItem = await this.constructor.findOne(
      {},
      {},
      { sort: { itemId: -1 } }
    );

    if (lastItem && lastItem.itemId) {
      this.itemId = lastItem.itemId + 1;
    } else {
      this.itemId = 1400; // Starting number
    }

    // ADDED: Double-check for uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.constructor.findOne({ itemId: this.itemId });
      if (!existing) break;

      this.itemId += 1;
      attempts += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);
export default GalleryItem;
