// models/offer.js
import mongoose from "mongoose";

const offerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: false }, // Optional
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
    previousData: { type: Object },
    updateHistory: [
      {
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

// FIXED: Improved pre-save hook with better error handling
offerSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    // Get the highest itemId and add 1
    const lastOffer = await this.constructor.findOne(
      {},
      {},
      { sort: { itemId: -1 } }
    );

    if (lastOffer && lastOffer.itemId) {
      this.itemId = lastOffer.itemId + 1;
    } else {
      this.itemId = 1400; // Starting number
    }

    // Double-check for uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.constructor.findOne({ itemId: this.itemId });
      if (!existing) break;

      this.itemId += 1;
      attempts += 1;
    }

    if (attempts >= 10) {
      throw new Error("Unable to generate unique itemId after 10 attempts");
    }

    console.log("Generated offer itemId:", this.itemId);
    next();
  } catch (error) {
    console.error("Error generating offer itemId:", error);
    next(error);
  }
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
