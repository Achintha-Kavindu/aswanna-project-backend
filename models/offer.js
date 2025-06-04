// models/offer.js
import mongoose from "mongoose";

const offerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: String, required: true },
    condition: [{ type: String }],
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    harvestDay: { type: Date, required: true },
    lastUpdated: { type: Date },
    itemId: { type: Number, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    previousData: { type: Object }, // Store previous data for comparison
    updateHistory: [
      {
        // Track update history
        updatedAt: { type: Date, default: Date.now },
        changes: { type: Object },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook
offerSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const count = await this.constructor.countDocuments();
    this.itemId = 1400 + count + 1;
    next();
  } catch (error) {
    next(error);
  }
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
